---
name: quant-validation
description: The methods a financial-ML result has to survive before it is evidence — purged cross-validation with an embargo, triple-barrier labelling, sample uniqueness under overlapping labels, fractional differentiation, meta-labelling, and multiple-testing correction. Written because the invariants were required of quant-researcher and nothing in the project explained how to satisfy them: a rule without a method produces either an invention or a block. Applied whenever a backtest, a feature or a label is being designed or judged.
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
# 验证金融模型——数字撒谎的五种方式

一个回测结果看起来非常出色、但上线后却亏钱，通常并不意味着策略很糟糕。它往往只是准确测量了错误的东西。下面的每一节都介绍一种机制：数字如何变得令人信服，却并不真实。

**关于来源。** 这里的方法都是标准方法，并且有明确出处——其中大多数来自 Marcos López de Prado 的 *Advances in Financial Machine Learning*，信息比率的框架则来自 Grinold & Kahn。本文件说明其中的机制以及需要检查的内容，并且有意不凭记忆复述公式。如果实现需要精确表达式——尤其是经调整的夏普比率——请在发布任何依赖该数值的结果之前，对照一手资料进行核验。在这里，一个凭记忆大致回想出的公式比没有公式更糟糕：它会产生一个具体、错误且看似自信的数字。

## 1. 带隔离期的剔除式交叉验证

**泄漏。** 在普通的 k 折划分中，训练行和测试行彼此不重叠。但在金融时间序列中，它们并不相互独立：时间 *t* 的标签是根据覆盖 *t* 到 *t+h* 的数据计算出来的。训练集中的某个观测如果落在这个窗口内，就已经看到了测试观测所要预测的未来。

**剔除。** 从训练集中删除所有标签窗口与任一测试观测的标签窗口重叠的观测。要删除的不是观测的时间戳，而是它的*标签窗口*。这一步经常被跳过，因为普通的时间戳划分看起来已经将两者分开了。

**隔离期。** 当特征存在序列相关性时，仅进行剔除还不够：紧接在测试集之后的训练行仍然携带关于测试集的信息。在每个测试折之后再删除一段额外的区间。这段区间占总样本的比例；不存在通用值，因此要说明所使用的数值及其原因。

**组合式剔除交叉验证。** 单个训练集/测试集划分只能产生一条回测路径和一个夏普比率。进行组合式划分可以得到许多路径，因而得到一个*分布*，而这才是你真正想要的结果：如果某个策略的单一路径看起来很好，但其分布跨越了零，那么它就告诉了你一些点估计所隐藏的信息。

**需要检查的内容：** 划分是否经过剔除，是否设置了隔离期，隔离期的大小是否已说明，以及报告的数值是一个分布还是单次抽样结果。

## 2. 三重障碍标签法

**固定期限收益的问题。** 将“未来五天的收益”作为标签，意味着你会持有五天。但你不会这样做：止损会在第二天将你平仓。模型训练所依据的是一个本不可能发生的结果。

**方法。** 为每个观测设置三道障碍——止盈水平、止损水平和时间限制。标签表示*最先触及的是哪道障碍*。障碍水平通常根据波动率估计值设定，而不是使用固定值，因为在不同市场状态下，2% 的变动意味着不同的事情。

**需要检查的内容：** 障碍是否按波动率缩放，时间限制是否已说明，以及标签记录的是结束该观测的具体障碍，而不只是涨跌方向。

## 3. 重叠标签下的样本唯一性

**问题。** 重叠的标签窗口意味着两行可能描述基本相同的结果。标准学习假设抽样彼此独立；但这里并非如此，因此有效样本远小于行数，基于该行数计算出的每个置信区间都会过窄。

**两种应对方式：** 根据每个观测值的平均唯一性（其标签窗口中未与其他窗口共享的部分有多少）为其加权；或者采用序贯自助法抽样，优先选择与已抽取观测值重叠较少的观测值。

**需要检查的内容：** 是否报告了唯一性加权或有效样本量。把行数作为样本量提供是错误的数字，而不是一个粗略的数字。

## 4. 分数阶差分

**两难。** 价格水平是非平稳的；基于价格水平拟合的模型学到的是一个不会重现的水平。通常的做法是进行一阶差分——收益率——这样序列具有平稳性，但也丢失了信号所依赖的记忆。

**方法。** 使用最小的阶数 `d` 进行差分，通常是分数阶差分，使序列在通过平稳性检验的同时，与未差分序列保持最大的相关性。`d` 是一个结果，而不是一个设置：它需要经过搜索，并且需要报告。

**需要检查的内容：** 是否报告了 `d`，是否进行了搜索而不是直接假定，以及是否测量了与原始序列的相关性——而不只是通过平稳性检验。通过检验是约束；保留记忆才是目标。

## 5. 元标签

**它是什么。** 不是一个模型，而是两个模型。主模型决定方向——做多、做空或空仓。次级模型只决定是否执行该判断，以二元方式表示：接受这笔交易还是放弃。

**为什么有帮助。** 这两个任务的错误代价不同。针对准确率调优的方向模型往往会交易过于频繁；次级模型可以在不改变方向逻辑的情况下提高精确率——减少交易，但让每笔交易都有更充分的依据。它还为根据置信度确定下注规模提供了一个自然位置，而单一模型会将下注规模与方向混为一谈。

**需要检查的内容：** 如果一个模型既选择方向，又决定是否交易，请说明这两个决策是否被分离。如果没有分离，那么报告的精确率实际上同时衡量了两个决策。

## 6. 多重检验问题

**机制。** 尝试足够多的配置，其中一个就会因偶然而表现得非常出色。N 次试验中最佳结果的 Sharpe 并不是该策略 Sharpe 的估计值——它是 N 次抽样结果中的最大值；即使每个策略都毫无价值，其期望值也会随着 N 的增加而上升。

**最低限度的诚实做法：** 报告 N。为了得到所报告的结果，尝试了多少组特征、参数值和投资范围。没有试验次数，就无法解读 Sharpe；而且这个次数通常比人们记得的要大得多——每个被放弃的变体也都要计入。

**修正方法：** 调整后的 Sharpe 比率会针对试验次数以及收益的非正态性进行调整。这里不再重述其确切表达式（参见上面的来源说明）；请根据主要来源实现。

**需要检查的内容：**是否报告了 N；如果声称进行了校正，实现是否注明了该表达式的来源。

## 此资料包不涵盖的内容

执行、订单路由、市场微观结构和投资组合构建。已安装的 quant 命令集已很好地覆盖了这些内容——经核实：十八个文件中包含订单簿、VWAP/TWAP 和执行偏差方面的材料，而没有涉及任何上述方法的内容。此资料包的存在正是为了填补这一空缺，而不是重复已有内容。