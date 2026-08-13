---
name: alterlab-molecular-dynamics
description: Runs and analyzes molecular dynamics simulations with OpenMM and MDAnalysis — setting up protein and small-molecule systems, assigning force fields, running energy minimization and production MD, and analyzing trajectories (RMSD, RMSF, contact maps, free energy surfaces). Use when simulating protein or ligand dynamics, equilibrating a system, or computing trajectory metrics for structural biology, drug binding, or biophysics. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# 分子动力学

## 概述

分子动力学（MD）模拟通过对牛顿运动方程进行积分，以计算方式模拟分子系统随时间的演化。本技能涵盖两个相辅相成的工具：

- **OpenMM** (https://openmm.org/)：支持 GPU、提供 Python API 并灵活支持多种力场的高性能 MD 模拟引擎
- **MDAnalysis** (https://mdanalysis.org/)：用于读取、写入和分析所有主流模拟软件包所生成 MD 轨迹的 Python 库

**安装**（已验证版本：OpenMM 8.x、MDAnalysis 2.x）：
```bash
# uv (preferred) — both ship binary wheels for arm64 macOS, no conda needed
uv add openmm "mdanalysis>=2.9" pdbfixer
# pdbfixer is not on PyPI for all platforms; if the wheel is unavailable:
uv pip install "pdbfixer @ git+https://github.com/openmm/pdbfixer.git"

# conda-forge alternative (pulls CUDA builds on Linux):
# conda install -c conda-forge openmm mdanalysis pdbfixer nglview
```
注意：Apple Silicon 上没有 CUDA；OpenMM 会回退到 `CPU`（在
macOS 上还包括 `OpenCL`/Metal）平台——请参阅下方的平台选择代码块。

## 何时使用本技能

在以下情形中使用分子动力学：

- **蛋白质稳定性分析**：突变会如何影响蛋白质动力学？
- **药物结合模拟**：表征配体的结合模式和驻留时间
- **构象采样**：探索蛋白质柔性和构象变化
- **蛋白质-蛋白质相互作用**：模拟界面动力学和结合能量学
- **RMSD/RMSF 分析**：量化相对于参考结构的结构波动
- **自由能估算**：计算结合自由能或构象自由能
- **膜模拟**：模拟脂质双层中的蛋白质
- **内在无序蛋白质**：研究 IDR 构象集合

## 核心工作流程：OpenMM 模拟

### 1. 系统准备

```python
from openmm.app import *
from openmm import *
from openmm.unit import *
import sys

def prepare_system_from_pdb(pdb_file, forcefield_name="amber14-all.xml",
                              water_model="amber14/tip3pfb.xml"):
    """
    Prepare an OpenMM system from a PDB file.

    Args:
        pdb_file: Path to cleaned PDB file (use PDBFixer for raw PDB files)
        forcefield_name: Force field XML file
        water_model: Water model XML file

    Returns:
        pdb, forcefield, system, topology
    """
    # Load PDB
    pdb = PDBFile(pdb_file)

    # Load force field
    forcefield = ForceField(forcefield_name, water_model)

    # Add hydrogens and solvate
    modeller = Modeller(pdb.topology, pdb.positions)
    modeller.addHydrogens(forcefield)

    # Add solvent box (10 Å padding, 150 mM NaCl)
    modeller.addSolvent(
        forcefield,
        model='tip3p',
        padding=10*angstroms,
        ionicStrength=0.15*molar
    )

    print(f"System: {modeller.topology.getNumAtoms()} atoms, "
          f"{modeller.topology.getNumResidues()} residues")

    # Create system
    system = forcefield.createSystem(
        modeller.topology,
        nonbondedMethod=PME,         # Particle Mesh Ewald for long-range electrostatics
        nonbondedCutoff=1.0*nanometer,
        constraints=HBonds,           # Constrain hydrogen bonds (allows 2 fs timestep)
        rigidWater=True,
        ewaldErrorTolerance=0.0005
    )

    return modeller, system
```

### 2. 能量最小化

```python
from openmm.app import *
from openmm import *
from openmm.unit import *

def minimize_energy(modeller, system, output_pdb="minimized.pdb",
                     max_iterations=1000, tolerance=10.0):
    """
    Energy minimize the system to remove steric clashes.

    Args:
        modeller: Modeller object with topology and positions
        system: OpenMM System
        output_pdb: Path to save minimized structure
        max_iterations: Maximum minimization steps
        tolerance: Convergence criterion in kJ/mol/nm

    Returns:
        simulation object with minimized positions
    """
    # Set up integrator (doesn't matter for minimization)
    integrator = LangevinMiddleIntegrator(300*kelvin, 1/picosecond, 0.004*picoseconds)

    # Create simulation
    # Use GPU if available (CUDA or OpenCL), fall back to CPU
    try:
        platform = Platform.getPlatformByName('CUDA')
        properties = {'DeviceIndex': '0', 'Precision': 'mixed'}
    except Exception:
        try:
            platform = Platform.getPlatformByName('OpenCL')
            properties = {}
        except Exception:
            platform = Platform.getPlatformByName('CPU')
            properties = {}

    simulation = Simulation(
        modeller.topology, system, integrator,
        platform, properties
    )
    simulation.context.setPositions(modeller.positions)

    # Check initial energy
    state = simulation.context.getState(getEnergy=True)
    print(f"Initial energy: {state.getPotentialEnergy()}")

    # Minimize
    simulation.minimizeEnergy(
        tolerance=tolerance*kilojoules_per_mole/nanometer,
        maxIterations=max_iterations
    )

    state = simulation.context.getState(getEnergy=True, getPositions=True)
    print(f"Minimized energy: {state.getPotentialEnergy()}")

    # Save minimized structure
    with open(output_pdb, 'w') as f:
        PDBFile.writeFile(simulation.topology, state.getPositions(), f)

    return simulation
```

### 3. NVT 平衡

```python
from openmm.app import *
from openmm import *
from openmm.unit import *

def run_nvt_equilibration(simulation, n_steps=50000, temperature=300,
                            report_interval=1000, output_prefix="nvt"):
    """
    NVT equilibration: constant N, V, T.
    Equilibrate velocities to target temperature.

    Args:
        simulation: OpenMM Simulation (after minimization)
        n_steps: Number of MD steps (50000 × 2fs = 100 ps)
        temperature: Temperature in Kelvin
        report_interval: Steps between data reports
        output_prefix: File prefix for trajectory and log
    """
    # Add position restraints for backbone during NVT
    # (Optional: restraint heavy atoms)

    # Set temperature
    simulation.context.setVelocitiesToTemperature(temperature*kelvin)

    # Add reporters
    simulation.reporters = []

    # Log file
    simulation.reporters.append(
        StateDataReporter(
            f"{output_prefix}_log.txt",
            report_interval,
            step=True,
            potentialEnergy=True,
            kineticEnergy=True,
            temperature=True,
            volume=True,
            speed=True
        )
    )

    # DCD trajectory (compact binary format)
    simulation.reporters.append(
        DCDReporter(f"{output_prefix}_traj.dcd", report_interval)
    )

    print(f"Running NVT equilibration: {n_steps} steps ({n_steps*2/1000:.1f} ps)")
    simulation.step(n_steps)
    print("NVT equilibration complete")

    return simulation
```

### 4. NPT 平衡与正式模拟

```python
def run_npt_production(simulation, n_steps=500000, temperature=300, pressure=1.0,
                        report_interval=5000, output_prefix="npt"):
    """
    NPT production run: constant N, P, T.

    Args:
        n_steps: Production steps (500000 × 2fs = 1 ns)
        temperature: Temperature in Kelvin
        pressure: Pressure in bar
        report_interval: Steps between reports
    """
    # Add Monte Carlo barostat for pressure control
    system = simulation.context.getSystem()
    system.addForce(MonteCarloBarostat(pressure*bar, temperature*kelvin, 25))
    simulation.context.reinitialize(preserveState=True)

    # Update reporters
    simulation.reporters = []
    simulation.reporters.append(
        StateDataReporter(
            f"{output_prefix}_log.txt",
            report_interval,
            step=True,
            potentialEnergy=True,
            temperature=True,
            density=True,
            speed=True
        )
    )
    simulation.reporters.append(
        DCDReporter(f"{output_prefix}_traj.dcd", report_interval)
    )

    # Save checkpoints
    simulation.reporters.append(
        CheckpointReporter(f"{output_prefix}_checkpoint.chk", 50000)
    )

    print(f"Running NPT production: {n_steps} steps ({n_steps*2/1000000:.2f} ns)")
    simulation.step(n_steps)
    print("Production MD complete")
    return simulation
```

## 使用 MDAnalysis 进行轨迹分析

### 1. 加载轨迹

```python
import MDAnalysis as mda
from MDAnalysis.analysis import rms, align, contacts
import numpy as np
import matplotlib.pyplot as plt

def load_trajectory(topology_file, trajectory_file):
    """
    Load an MD trajectory with MDAnalysis.

    Args:
        topology_file: PDB, PSF, or other topology file
        trajectory_file: DCD, XTC, TRR, or other trajectory
    """
    u = mda.Universe(topology_file, trajectory_file)
    print(f"Universe: {u.atoms.n_atoms} atoms, {u.trajectory.n_frames} frames")
    print(f"Time range: 0 to {u.trajectory.totaltime:.0f} ps")
    return u
```

### 2. RMSD 分析

```python
def compute_rmsd(u, selection="backbone", reference_frame=0):
    """
    Compute RMSD of selected atoms relative to reference frame.

    Args:
        u: MDAnalysis Universe
        selection: Atom selection string (MDAnalysis syntax)
        reference_frame: Frame index for reference structure

    Returns:
        numpy array of (time, rmsd) values
    """
    # Pre-align the trajectory (rewrites coordinates in memory) so that any
    # downstream per-atom analysis sees superimposed frames.
    aligner = align.AlignTraj(u, u, select=selection, in_memory=True)
    aligner.run()

    # rms.RMSD does its own optimal superposition against ref_frame, so the
    # RMSD numbers below do not depend on the AlignTraj step above.
    R = rms.RMSD(u, select=selection, ref_frame=reference_frame)
    R.run()

    rmsd_data = R.results.rmsd  # columns: frame, time, RMSD
    return rmsd_data

def plot_rmsd(rmsd_data, title="RMSD over time", output_file="rmsd.png"):
    """Plot RMSD over simulation time."""
    fig, ax = plt.subplots(figsize=(10, 4))
    ax.plot(rmsd_data[:, 1] / 1000, rmsd_data[:, 2], 'b-', linewidth=0.5)
    ax.set_xlabel("Time (ns)")
    ax.set_ylabel("RMSD (Å)")
    ax.set_title(title)
    ax.axhline(rmsd_data[:, 2].mean(), color='r', linestyle='--',
               label=f'Mean: {rmsd_data[:, 2].mean():.2f} Å')
    ax.legend()
    plt.tight_layout()
    plt.savefig(output_file, dpi=150)
    return fig
```

### 3. RMSF 分析（逐残基柔性）

```python
def compute_rmsf(u, selection="backbone", start_frame=0):
    """
    Compute per-residue RMSF (flexibility).

    Returns:
        resids, rmsf_values arrays
    """
    # Select atoms
    atoms = u.select_atoms(selection)

    # Compute RMSF
    R = rms.RMSF(atoms)
    R.run(start=start_frame)

    # Average by residue
    resids = []
    rmsf_per_res = []
    for res in u.select_atoms(selection).residues:
        res_atoms = res.atoms.intersection(atoms)
        if len(res_atoms) > 0:
            resids.append(res.resid)
            rmsf_per_res.append(R.results.rmsf[res_atoms.indices].mean())

    return np.array(resids), np.array(rmsf_per_res)
```

### 4. 蛋白质-配体接触分析

```python
from MDAnalysis.lib import distances as mda_distances

def analyze_contacts(u, protein_sel="protein", ligand_sel="resname LIG",
                      radius=4.5, start_frame=0):
    """
    Track which protein residues are in contact with the ligand per frame.

    Args:
        radius: Contact distance cutoff in Angstroms

    Returns:
        list of sets, one per analyzed frame, of contacting protein resids
    """
    protein = u.select_atoms(protein_sel)
    ligand = u.select_atoms(ligand_sel)

    contact_frames = []
    for ts in u.trajectory[start_frame:]:
        # Pairwise protein-ligand distance matrix (PBC-aware via box=u.dimensions),
        # then threshold into a boolean contact matrix.
        # NOTE: contacts.contact_matrix(d, radius) takes a *distance matrix* d,
        # not raw coordinates — passing positions directly is a common bug.
        dmat = mda_distances.distance_array(
            protein.positions, ligand.positions, box=u.dimensions
        )
        contact_mask = contacts.contact_matrix(dmat, radius)  # shape (n_prot, n_lig)

        # A protein atom is in contact if it is close to any ligand atom.
        contacting_atoms = protein.atoms[contact_mask.any(axis=1)]
        contact_frames.append(set(contacting_atoms.resids))

    return contact_frames
```

## 力场选择指南

| 系统 | 推荐力场 | 水模型 |
|--------|------------------------|-------------|
| 标准蛋白质 | AMBER14 (`amber14-all.xml`) | TIP3P-FB |
| 蛋白质 + 小分子 | AMBER14 + GAFF2 | TIP3P-FB |
| 膜蛋白 | CHARMM36m | TIP3P |
| 核酸 | AMBER99-bsc1 或 AMBER14 | TIP3P |
| 无序蛋白质 | ff19SB 或 CHARMM36m | TIP3P |

## 系统准备工具

### PDBFixer（用于原始 PDB 文件）

```python
from pdbfixer import PDBFixer
from openmm.app import PDBFile

def fix_pdb(input_pdb, output_pdb, ph=7.0):
    """Fix common PDB issues: missing residues, atoms, add H, standardize."""
    fixer = PDBFixer(filename=input_pdb)
    fixer.findMissingResidues()
    fixer.findNonstandardResidues()
    fixer.replaceNonstandardResidues()
    fixer.removeHeterogens(True)    # Remove water/ligands
    fixer.findMissingAtoms()
    fixer.addMissingAtoms()
    fixer.addMissingHydrogens(ph)

    with open(output_pdb, 'w') as f:
        PDBFile.writeFile(fixer.topology, fixer.positions, f)

    return output_pdb
```

### 小分子参数化（通过 OpenFF Toolkit）

```python
# uv add openff-toolkit openff-interchange
# openff-2.2.0.offxml is OpenFF "Sage" — a SMIRNOFF force field, NOT GAFF2.
# (For actual GAFF2, parameterize with AmberTools antechamber/ACPYPE instead.)
from openff.toolkit import Molecule, ForceField as OFFForceField

def parameterize_ligand(smiles, ff_name="openff-2.2.0.offxml"):
    """Generate OpenFF (Sage) parameters for a small molecule as an Interchange."""
    mol = Molecule.from_smiles(smiles)
    mol.generate_conformers(n_conformers=1)
    mol.assign_partial_charges("am1bcc")  # AM1-BCC charges, OpenFF default

    off_ff = OFFForceField(ff_name)
    interchange = off_ff.create_interchange(mol.to_topology())
    return interchange  # -> interchange.to_openmm() for an OpenMM System
```

## 最佳实践

- **在进行 MD 之前始终先执行能量最小化**：原始 PDB 结构存在空间位阻冲突
- **在正式模拟之前进行平衡**：NVT（50–100 ps）→ NPT（100–500 ps）→ 正式模拟
- **使用 GPU**：在 GPU（CUDA/OpenCL）上运行模拟可提速 10–100 倍
- **采用 HBonds 约束时使用 2 fs 时间步长**：这是标准设置；采用 HMR（氢质量重分配）时可使用 4 fs
- **仅分析已平衡的轨迹**：丢弃前 20–50% 的轨迹，将其视为平衡阶段
- **保存检查点**：MD 运行可能失败；检查点可用于重新启动
- **周期性边界条件**：溶剂化体系必须使用
- **静电相互作用使用 PME**：对于带电体系，它比截断方法更准确

## 其他资源

- **OpenMM 文档**：https://docs.openmm.org/latest/userguide/
- **MDAnalysis 用户指南**：https://docs.mdanalysis.org/
- **GROMACS**（替代 MD 引擎）：https://manual.gromacs.org/
- **NAMD**（替代方案）：https://www.ks.uiuc.edu/Research/namd/
- **CHARMM-GUI**（基于 Web 的体系构建工具）：https://charmm-gui.org/
- **AmberTools**（免费的 Amber 工具）：https://ambermd.org/AmberTools.php
- **OpenMM 论文**：Eastman P et al. (2017) PLOS Computational Biology 13(7):e1005659. PMID: 28746339 (DOI: 10.1371/journal.pcbi.1005659)
- **MDAnalysis 论文**：Michaud-Agrawal N et al. (2011) J Computational Chemistry. PMID: 21500218