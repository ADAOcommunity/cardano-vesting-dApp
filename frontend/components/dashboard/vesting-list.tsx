import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { tokenNameFromHex } from "@/utils/utils"
import { Constr, Data, UTxO } from "lucid-cardano"
import { Button } from "../ui/button"
import { useContext } from "react"
import { UserContext } from "@/pages/_app"
import { validator } from "@/validators/validator"

type Props = {
  claimable: {
    assets:{
      [key: string]: bigint
    },
    utxos: UTxO[]
  }
}
export default function VestingList({ claimable }: Props) {
  const { lucid, user } = useContext(UserContext)

  const claim = async (utxos: UTxO[]) => {
    if (lucid) {
      console.log({utxos, validator, hash: lucid.utils.validatorToScriptHash(validator), addr:lucid.utils.validatorToAddress(validator)})
      const redeemer = Data.to(new Constr(0, []))
      console.log({redeemer})
      const tx = await lucid.newTx()
        .collectFrom(utxos, redeemer)
        .validFrom(Date.now())
        .validTo(Date.now() + 1000 * 60 )
        .addSigner(user.address)
        .attachSpendingValidator(validator)
        .complete()
      const signedTx = await tx.sign().complete()
      const txHash = await signedTx.submit()
      console.log(txHash)
    }
  }

  return (
    <div className="space-y-8">

      {Object.keys(claimable?.assets || []).map((key) => {
        return (
          <div className="flex items-center">
            {/* <Avatar className="h-9 w-9">
              <AvatarImage src="/avatars/01.png" alt="Avatar" />
              <AvatarFallback>OM</AvatarFallback>
            </Avatar> */}
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{tokenNameFromHex(key.slice(56))}</p>
              <p className="text-sm text-muted-foreground">
                {key.slice(0, 56)} {/* policyId */}
              </p>
            </div>
            <div className="ml-auto font-medium">+{claimable.assets[key].toString()}</div>
          </div>
        )
      })}
            <Button variant="outline" onClick={() => claim(claimable.utxos)} >Claim</Button>

    </div>
  )
}