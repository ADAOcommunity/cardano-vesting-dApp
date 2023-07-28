import { SpendingValidator } from "lucid-cardano"

export const scriptCbor = "5902050100003232323232323232323232322223253330093232533300b3370e900100089919918008009129998090008a5113232533301000213300400400114a0602c00466e1d20023010375460280026602266601866646444660066eb0cc030c03800920100013001001222533301300214a026464a66602266e3c00800c5288999802802800801980b8019bae301500233008300a00548000dd719804180500224004980103d87a80004c0103d87980003301133300c3322323253330103370e90010008991919b89005001375a602e002601c0042940c038004cc028c030cc028c030009200048000cc020c028cc020c028015200048038dd69980418050022400098103d87a80004c0103d87980004bd7018048010a5030090013300530070024800852616320043253330093370e90000008991919192999808980a0010a4c2a6601c921334c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2065787065637465640016375c602400260240046eb4c040004c01c01054cc0292412b436f6e73747220696e64657820646964206e6f74206d6174636820616e7920747970652076617269616e740016300700333001001480008888cccc01ccdc38008018069199980280299b8000448008c03c0040080088c018dd5000918021baa0015734ae7155ceaab9e5573eae815d0aba21"
export const validator: SpendingValidator = {
    type: "PlutusV2",
    script: scriptCbor,
}