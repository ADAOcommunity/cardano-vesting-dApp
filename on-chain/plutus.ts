// deno-lint-ignore-file
import {
  applyParamsToScript,
  Data,
  Validator,
} from "https://deno.land/x/lucid@0.10.7/mod.ts";

export interface BeaconBeaconToken {
  new (scriptHash: string, stakeHash: string): Validator;
  rdmr: "Mint" | "Burn";
}

export const BeaconBeaconToken = Object.assign(
  function (scriptHash: string, stakeHash: string) {
    return {
      type: "PlutusV2",
      script: applyParamsToScript(
        "5903dc010000323232323232323232323223223222323232323232533301132323232323232323232323232323232323253330233370e900000088018801181080b9980a00311919baf374c0026e992f5bded8c064660260020186eaccc078c0800052002330130012323253330263029002132323232323232323232533302d533302d533302d3375e66052605601a900000e099b8700948008528099b8f00300a14a0266e3c0040585281bae30310013031002375c605e002605e002605c002605a0026058002604664a66604c66e1d20003025001100116323253330273370e90000008b0a99981399b87480080044c98c0940084c8c8c8008c94ccc0a8cdc3a4000002264646464646464646464646464646464646464646464a666086608c0042930b1bae30440013044002375c608400260840046eb4c100004c100008dd6981f000981f0011bad303c001303c002375c607400260740046eb8c0e0004c0e0008dd6981b000981b0011bad30340013034002375c606400260640046eb8c0c0004c0a000858c0a0004c0b4004c094008c094004cc084c08c0152004375a604c0046eb8c09000458c09c004c8cc04800402cdd59980e980f800a400466646002002444a66604a004297ae01323253330243003002133028002333005005001003133300500500100330290033027002004233323001001222533302600214a026464a66604a66e3c00800c528899980280280080198150019bae30280023323223002001300100122533302500114bd700991919198149ba900133005005002375c604a0046052004604e0026eaccc070c078005200200937566046002604600260440046eb0c080004c080004c07c004c058014dd7180e000980a299980b19b8748000c054004400458c068004c068008c060004c040020cdd2a40006602a66e95200233015375201697ae0330153374a90001980a99ba548000cc054cdd2a40006602a6ea40252f5c097ae04bd7025eb805261622323253330143370e90010008a5eb7bdb1804c8dd5980d00098090011809000998018010009800800911299980a0010a6103d87a800013232323253330153371e00a002266e95200033019374c00497ae01333007007003005375c602a0066eacc054008c06000cc058008c0040048894ccc048008528899192999808980180109998028028008018a50301600330140023200332533300c3370e90000008a99980798050018a4c2c2a66601866e1d20020011533300f300a00314985858c028008dd70009bae00133001001480008888cccc01ccdc38008018061199980280299b8000448008c0380040080088c014dd5000918019baa0015734aae7555cf2ab9f5740ae855d101",
        [scriptHash, stakeHash],
        {
          "dataType": "list",
          "items": [{ "dataType": "bytes" }, { "dataType": "bytes" }],
        } as any,
      ),
    };
  },
  {
    rdmr: {
      "title": "Action",
      "anyOf": [{
        "title": "Mint",
        "dataType": "constructor",
        "index": 0,
        "fields": [],
      }, {
        "title": "Burn",
        "dataType": "constructor",
        "index": 1,
        "fields": [],
      }],
    },
  },
) as unknown as BeaconBeaconToken;

export interface OrgTokenOrgToken {
  new (
    tokenName: string,
    utxoRef: { transactionId: { hash: string }; outputIndex: bigint },
  ): Validator;
  rdmr: "Mint" | "Burn";
}

export const OrgTokenOrgToken = Object.assign(
  function (
    tokenName: string,
    utxoRef: { transactionId: { hash: string }; outputIndex: bigint },
  ) {
    return {
      type: "PlutusV2",
      script: applyParamsToScript(
        "590240010000323232323232323232323223222232533300b323232323232323232323232323232533301d30200021323232533301d3370e9000000899299980f19b884800000c4cdc780200c0a50301b32533301e3370e9000180e80088008b1999180080091129998118010a6103d87a8000132325333022300300213374a90001981300125eb804ccc01401400400cc09c00cc09400802c8cdd79980d180e000a400002e2a66603a66e1c009200113371e00602e2940c06c048dd6980e8011bae301b00116301e00132333232223232533301f3370e90010008a5eb7bdb1804c8dd59812800980e801180e800998018010009800800911299980f8010a60103d87a800013232323253330203371e00a002266e95200033024374c00497ae01333007007003005375c60400066eacc080008c08c00cc084008004024cc8c88cc0080052201003001001222533301e00214bd6f7b630099191919299980f99b8f0050011003133023337606ea4004dd30011998038038018029bae301f0033756603e004604400660400040026eacc070004c070004c06c004c068004c064008dd6180b80098078029bae3015001300d533300f3370e9000180700088008b18098009809801180880098048010a4c2c6400664a66601666e1d20000011533300e300900314985854ccc02ccdc3a40040022a66601c60120062930b0b18048011bae00133001001480008888cccc01ccdc38008018061199980280299b8000448008c0380040080088c014dd5000918019baa0015734aae7555cf2ab9f5740ae855d11",
        [tokenName, utxoRef],
        {
          "dataType": "list",
          "items": [{ "dataType": "bytes" }, {
            "title": "OutputReference",
            "description":
              "An `OutputReference` is a unique reference to an output on-chain. The `output_index`\n corresponds to the position in the output list of the transaction (identified by its id)\n that produced that output",
            "anyOf": [{
              "title": "OutputReference",
              "dataType": "constructor",
              "index": 0,
              "fields": [{
                "title": "transactionId",
                "description":
                  "A unique transaction identifier, as the hash of a transaction body. Note that the transaction id\n isn't a direct hash of the `Transaction` as visible on-chain. Rather, they correspond to hash\n digests of transaction body as they are serialized on the network.",
                "anyOf": [{
                  "title": "TransactionId",
                  "dataType": "constructor",
                  "index": 0,
                  "fields": [{ "dataType": "bytes", "title": "hash" }],
                }],
              }, { "dataType": "integer", "title": "outputIndex" }],
            }],
          }],
        } as any,
      ),
    };
  },
  {
    rdmr: {
      "title": "Action",
      "anyOf": [{
        "title": "Mint",
        "dataType": "constructor",
        "index": 0,
        "fields": [],
      }, {
        "title": "Burn",
        "dataType": "constructor",
        "index": 1,
        "fields": [],
      }],
    },
  },
) as unknown as OrgTokenOrgToken;

export interface VestingVesting {
  new (): Validator;
  datum: {
    datumId: string;
    beneficiary: string;
    date: bigint;
    tokensRequired: bigint;
    orgToken: string;
    beaconToken: string;
    numPeriods: bigint;
    periodLength: bigint;
    amountPerPeriod: bigint;
    tokenPolicyId: string;
    tokenName: string;
  };
  rdmr: "Claim" | "Cancel";
}

export const VestingVesting = Object.assign(
  function () {
    return {
      type: "PlutusV2",
      script:
        "59088c01000032323232323232323232322223232533300a3232323232323232323232323232323232323232323232323253330233370e900000089999991919191919191911111919191919299981a19b89003002100114a06601200c464a66606a66ebcdd30009ba64bd6f7b6300a5113375e6606260660049000180680519198100009bae33031303300948028dd5998181819000a4004646464646466e04004008cdc10011bad33032303400a48040c8c8cdc080100099911919191919980b9bab33038303a33038303a0014800920020060053040001303832533303b3370e9000181d00088008b198099bac33036303833036303800f48001200023375e6606e60720029000001181f000981b19299981c99b8748008c0e0004400458cc0d0c0d80352002375c66064606801490091bae33032303400a48050cdc119b82375a66062606601290071bad33031303300948040dd6998189819804a401866e0c004dd69981818190042401c66e04004dd6998179818803a40086464a66606866e1d2002001132375a607400260640042a66606866e1d2004001161630320013302e30303302e30303302e30303302e303000748001200e48001200032323232323232323232323232323232323232323370200800266603e00201000c6466604600297adef6c602233027001375666084608800490011980f9bac3303f30410044801094ccc110cdd7998201821198201821000a4000900019820182100124000266ebccc100c10800520043374a90021982400c25eb80528180d00b99980e00080280199199810000a5eb7bdb18088cc090004dd59981f982080124004660386eb0cc0f0c0f8005200423232323375e00400266e952000330473374a9000198239ba90104bd7019823a60103d87a80004bd7019ba548000cc118004cc119300103d87a80004bd701981e981f9981e981f800a400090001981d981e80a240006eb8c10c004c10c008dd7182080098208009820000981f800981f000981e800981e000981d800981d0011bae30380013038001302f0053035001302d533302f3370e9001181700088008b180080091129998178010a5113232533302e3003002133300500500100314a0606600660620044646464646605260566605260560029001240006062002605264a66605866e1d2000302b0011001163300437586604e60526604e6052006900024000466ebccc0a0c0a80052000002302f001302732533302a3370e9001181480088008b198129813800a40046002002444a666058004298103d87a800013232533302b300300213374a90001981780125eb804ccc01401400400cc0c000cc0b8008888c8c94ccc0b4c0c00084c8c8c94ccc0b40044008520003371e00400a6eb4c0b4008dd718158008b181700099809801801180080091129998148010a5eb804c8c94ccc0a0c00c0084cc0b0008ccc01401400400c4ccc01401400400cc0b400cc0ac0080700680440584cdc49bad3301f302101a48018c8c8c8c94ccc0a8c0b40084c8dd698150011bae302800116302b001330100010023330030154bd6f7b63011198038009bab330223024330223024002480092002375c6603e60420349004181080d18008009111299981380188010991919998030030009980180100200198158021814801911999804001000911192999812a9998140008a5114a0298103d87a800013374a9000198149ba60014bd70199980380100091119299981419b87001480005300103d87a800013374a9000198161ba80014bd7019b8000200100600322533302033720004002298103d8798000153330203371e0040022980103d87a800014c103d87b800030010012222253330240041003132323232333330090090033333300a007001002006005006005375c604a0066eb4c094008c0a0014c098010c0040048888894ccc08c0144cc090cdd81ba9004375000697adef6c6013232323253330243375e6600a01000298103d8798000133028337606ea4020dd40038048a99981219b8f0080011323253330263370e9000000899191981619bb037520186ea000401cdd6981600098120010802981200099980300400380109981419bb037520026ea0008cccccc02802800c02001c018014dd718120019bad30240023027006302500530010012222253330200041003132323232333330090090033333300a007001002006005006005375c60420066eacc084008c090014c088010c0040048888894ccc07c0144cc080cdd81ba9004374c00697adef6c6013232323253330203375e6600a01000298103d8798000133024337606ea4020dd30038048a99981019b8f0080011323253330223370e9000000899191981419bb037520186e9800401cdd5981400098100010802981000099980300400380109981219bb037520026e98008cccccc02802800c02001c018014dd718100019bab30200023023006302100522323253330193370e90010008a5eb7bdb1804c8dd5980f800980b801180b800998018010009800800911299980c8010a60103d87a8000132323232533301a3371e00a002266e9520003301e374c00497ae01333007007003005375c60340066eacc068008c07400cc06c008dd6180b800980b800980b0011bac3014001300c0033012001301200230100013008003149858c8014c94ccc028cdc3a4000002264646464646464646464646464646464646464646464a666046604c0042930b1bae30240013024002375c604400260440046eb4c080004c080008dd6980f000980f0011bad301c001301c002375c603400260340046eb8c060004c060008dd6980b000980b0011bad30140013014002375c602400260240046eb8c040004c02001458c020010c800cc94ccc024cdc3a40000022a666018600e0062930b0a99980499b874800800454ccc030c01c00c5261616300700233001001480008888cccc01ccdc38008018061199980280299b8000448008c0380040080088c014dd5000918019baa0015734aae7555cf2ab9f5740ae855d11",
    };
  },
  {
    datum: {
      "title": "Datum",
      "anyOf": [{
        "title": "Datum",
        "dataType": "constructor",
        "index": 0,
        "fields": [
          { "dataType": "bytes", "title": "datumId" },
          { "dataType": "bytes", "title": "beneficiary" },
          { "dataType": "integer", "title": "date" },
          { "dataType": "integer", "title": "tokensRequired" },
          { "dataType": "bytes", "title": "orgToken" },
          { "dataType": "bytes", "title": "beaconToken" },
          { "dataType": "integer", "title": "numPeriods" },
          { "dataType": "integer", "title": "periodLength" },
          { "dataType": "integer", "title": "amountPerPeriod" },
          { "dataType": "bytes", "title": "tokenPolicyId" },
          { "dataType": "bytes", "title": "tokenName" },
        ],
      }],
    },
  },
  {
    rdmr: {
      "title": "Action",
      "anyOf": [{
        "title": "Claim",
        "dataType": "constructor",
        "index": 0,
        "fields": [],
      }, {
        "title": "Cancel",
        "dataType": "constructor",
        "index": 1,
        "fields": [],
      }],
    },
  },
) as unknown as VestingVesting;

export interface VestingOldVesting {
  new (): Validator;
  datum: { beneficiary: string; date: bigint };
  _redeemer: undefined;
}

export const VestingOldVesting = Object.assign(
  function () {
    return {
      type: "PlutusV2",
      script:
        "59019601000032323232323232323232322223253330093232533300b3370e900100089919918008009129998088008a5113232533301000213300400400114a0602a00466e1d2002300f375460260026602066601866646444660066eb0cc030c03800920100013001001222533301200214a026464a66602266e3c00800c5288999802802800801980b0019bae301400233008300a00548000dd719804180500224000980103d87a80004c0103d87980003301033300c3322323253330103370e90010008991919b89005001375a602c002601c0042940c038004cc028c030cc028c030009200048000cc020c028cc020c028015200048038dd69980418050022400498103d87a80004c0103d87980004bd7018048010a5030090013300530070024800852616320043253330093370e9000000899191919299980818098010a4c2c6eb4c044004c044008dd7180780098038020b180380199800800a40004444666600e66e1c00400c0308cccc014014cdc000224004601c0020040044600a6ea80048c00cdd5000ab9a5573aaae7955cfaba05742ae881",
    };
  },
  {
    datum: {
      "title": "Datum",
      "anyOf": [{
        "title": "Datum",
        "dataType": "constructor",
        "index": 0,
        "fields": [{ "dataType": "bytes", "title": "beneficiary" }, {
          "dataType": "integer",
          "title": "date",
        }],
      }],
    },
  },
  {
    _redeemer: {
      "title": "Unit",
      "description": "The nullary constructor.",
      "anyOf": [{ "dataType": "constructor", "index": 0, "fields": [] }],
    },
  },
) as unknown as VestingOldVesting;
