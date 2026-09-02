---
name: quant-validation
description: 'The methods a financial-ML result has to survive before it is evidence — purged cross-validation with an embargo, triple-barrier labelling, sample uniqueness under overlapping labels, fractional differentiation, meta-labelling, and multiple-testing correction. Written because the invariants were required of quant-researcher and nothing in the project explained how to satisfy them: a rule without a method produces either an invention or a block. Applied whenever a backtest, a feature or a label is being designed or judged.'
when_to_use: |
  Apply when work touches the validity of a financial model, not its returns:
  - quant-researcher designs or judges a backtest, a feature set, or a labelling scheme
  - anyone reports a Sharpe ratio, a hit rate, or an out-of-sample figure
  - a cross-validation scheme is being chosen for a time series with overlapping labels
  Do NOT apply to execution, order routing or market microstructure — that is a
  different body of knowledge and this pack does not cover it.
effort: low
allowed-tools: Read, Write, Grep, Glob
paths:
  - "docs/research/**"
  - "docs/architecture/**"
---
# 验证金融模型——数字最常见的五种谎言

一个看起来极其出色、实盘却亏钱的回测，通常并不是坏策略。它只是对错误事物的良好测量。下面每一节都在说明：一个数字如何在变得“有说服力”的同时并不变得“真实”。

**关于来源。** 这里的方法都是标准且可追溯的——大多来自 Marcos López de Prado 的 *Advances in Financial Machine Learning*，信息比率的表述则来自 Grinold & Kahn。此文件说明的是**机制**以及该检查什么，并且有意不从记忆中重述公式。凡是实现需要精确表达式的地方——尤其是 deflated Sharpe ratio——在发布任何依赖它的数字之前，都要先对照原始来源验证。这里，近似回忆出的公式比没有公式更糟：它会给出一个具体、错误、自信的数值。

## 1. 带 embargo 的 purged cross-validation

**泄漏。** 在普通的 k-fold 切分中，训练集和测试集的行是互不相交的。但在金融时间序列中，它们并不是独立的：时间 *t* 的标签是用覆盖 *t* 到 *t+h* 的数据计算出来的。训练集中落在这个窗口内的一条观测，已经看到了测试观测被要求预测的未来。

**Purging。** 从训练集中删除每一条其标签窗口与任何测试观测的标签窗口重叠的观测。删掉的不是观测的时间戳，而是它的**标签窗口**。这一步经常被跳过，因为简单的时间戳切分看起来已经把它们分开了。

**Embargo。** 当特征存在序列相关性时，purging 还不够：紧挨着测试集之后的训练行仍然携带关于测试集的信息。要在每个测试折之后再删掉一段缓冲区。这个缓冲区是总样本的一部分；没有统一的取值，所以必须说明所用的值以及原因。

**Combinatorial purged CV。** 单次训练/测试切分只给出一条回测路径和一个 Sharpe。以组合方式切分会产生多条路径，因此得到的是一个**分布**，而这才是你真正想要的：一条单路径看起来很好、而其分布跨越零的策略，已经告诉了你一些单点估计会掩盖的东西。

**要检查什么：** 切分是否做了 purging，是否有 embargo，embargo 的大小是否已说明，以及报告的结果是一个分布还是单次抽样。

## 2. Triple-barrier 标注

**固定期限收益的问题。** 把“未来五天的收益”作为标签，等于假设你会持有五天。但你不会：第 2 天止损就会把你踢出场。模型被训练去拟合一个根本不可能发生的结果。

**方法。** 每个观测设置三个 barrier——止盈、止损和时间限制。标签是**最先触及的是哪一个 barrier**。这些水平通常不是固定值，而是基于波动率估计来设定，因为 2% 的变动在不同市场状态下意义不同。

**要检查什么：** barrier 是否按波动率缩放，时间限制是否已说明，以及标签记录的是哪个 barrier 终结了该观测，而不只是方向。

## 3. 重叠标签下的样本唯一性

**问题。** 重叠的标签窗口意味着两行数据可能描述了很大程度上相同的结果。标准学习假设独立抽样；这里并非如此，所以有效样本远小于行数，而任何基于该行数计算的置信区间都会过窄。

**两种应对：** 按每个观测的平均唯一性加权（即其标签窗口中有多少部分没有与他人共享），或者使用顺序自助法抽样，优先抽取与已抽样观测重叠较少的样本。

**要检查什么：** 是否报告了唯一性加权或有效样本量。把行数当作样本量给出的结果是错误数字，不是近似值。

## 4. 分数阶差分

**困境。** 价格水平是非平稳的；对其拟合模型会学到一个不会再出现的水平。直觉上的做法是一阶差分——收益率——它是平稳的，但也丢掉了信号所依附的记忆。

**方法。** 以最小的阶数 `d` 进行差分，通常是分数阶差分，直到序列通过平稳性检验，同时尽可能保留与未差分序列的相关性。`d` 是一个结果，不是一个设定：它需要被搜索出来，并被报告。

**要检查什么：** `d` 是否被报告了，是否是搜索得到而不是假定的，以及是否测量了与原始序列的相关性——而不只是通过了平稳性检验。通过检验只是约束；保留记忆才是目标。

## 5. 元标签

**它是什么。** 不是一个模型，而是两个模型。第一个模型决定 SIDE——做多、做空、空仓。第二个模型只决定是否执行这个判断，作为二元决策：下这笔单，或者不下。

**为什么有用。** 这两个任务的错误代价不同。一个为了准确率而调优的方向模型往往会交易过于频繁；第二个模型可以提高精度——更少但更有把握的交易——而不触动方向逻辑。它也为按置信度进行仓位大小设定提供了自然位置，而单一模型会把这与方向混在一起。

**要检查什么：** 如果一个模型既选方向又决定是否交易，要说明这两者是否分离。如果没有，报告的精度是在同时衡量两个决策。

## 6. 多重检验问题

**机制。** 尝试足够多的配置，总有一个会因为偶然性看起来很优秀。所报告的 N 次试验中最好的那个 Sharpe，并不是该策略 Sharpe 的估计值——它是 N 个抽样中的最大值，即使每个策略都毫无价值，它的期望也会随 N 增加。

**最基本的诚实回应：** 报告 N。为了得到所报告的结果，尝试了多少特征组合、参数值和投资范围。没有试验次数的 Sharpe 不能被解释，而这个次数通常比人们记得的大得多——每个被放弃的变体都算数。

**修正：** deflated Sharpe ratio 会针对试验次数以及收益的非正态性进行调整。这里不复述其精确表达式（见上面的来源说明）；请依据原始来源实现。

**检查内容：**是否报告了 N；如果声称有修正，实施是否引用了该表达式的来源。

## 本 pack 不涵盖什么

执行、订单路由、市场微观结构和投资组合构建。已安装的 quant 命令集在这些方面覆盖得很好——具体而言：order-book、VWAP/TWAP 以及 implementation-shortfall 相关材料，共十八个文件，而上述任何方法都没有内容。这个 pack 的存在正是为了填补这一空缺，而不是重复已有内容。