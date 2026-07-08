# 三菱UFJ 入出金明細 网页模板

在线编辑银行流水版式，左侧改字段，右侧实时预览，可打印为 PDF。

## 在线访问

部署后地址：

`https://ajkdfe2e2e.github.io/mufg-statement-template/`

## 可替换字段

- 姓名、店番、店名、科目、口座番号
- 照会期間、絞り込み、Eco通帳申込日
- 銀行コード（右上角两行标签旁）
- 显示时间、印刷时间、页码
- フッター URL、合计金额、Copyright 年份
- 全部交易明细行

## 本地运行

```powershell
cd mufg-statement-template
python -m http.server 8080
```

打开 http://localhost:8080

## 注意

仅供版式编辑练习，请勿用于伪造银行文件。
