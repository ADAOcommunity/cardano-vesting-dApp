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
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

type Props = {
    beneficiaries: {
        [key: string]: { //beneficiary
            [key: string]: {  // asset name of vested token
                totalVested: bigint,
                withdrawablePeriods: number,
                redeemable: bigint,
                withdrawn: bigint,
                remaining: bigint,
                utxos: UTxO[]
            }
        }
    }
}
export default function BeneficiariesList({ beneficiaries }: Props) {
    const { lucid, user } = useContext(UserContext)

    const claim = async (utxos: UTxO[]) => {
        if (lucid) {
            console.log({ utxos, validator, hash: lucid.utils.validatorToScriptHash(validator), addr: lucid.utils.validatorToAddress(validator) })
            const redeemer = Data.to(new Constr(0, []))
            console.log({ redeemer })
            const tx = await lucid.newTx()
                .collectFrom(utxos, redeemer)
                .validFrom(Date.now())
                .validTo(Date.now() + 1000 * 60)
                .addSigner(user.address)
                .attachSpendingValidator(validator)
                .complete()
            const signedTx = await tx.sign().complete()
            const txHash = await signedTx.submit()
            console.log(txHash)
        }
    }
    console.log({ beneficiaries })
    return (
        <div className="space-y-8">

            {Object.keys(beneficiaries || []).map((pkh) => {
                return (
                    <Card key={pkh} className="border-2">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium" title={pkh} >
                                {pkh}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <>
                                {Object.keys(beneficiaries[pkh]).map((assetName) => {

                                    return (<div key={assetName} className="flex w-full items-center">
                                        {/* <Avatar className="h-9 w-9">
                     <AvatarImage src="/avatars/01.png" alt="Avatar" />
                     <AvatarFallback>OM</AvatarFallback>
                   </Avatar> */}
                                        <div className="ml-4 space-y-1 w-full">
                                            <p className="text-sm font-medium leading-none">{tokenNameFromHex(assetName.slice(56))}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {assetName.slice(0, 56)} {/* policyId */}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium">+{beneficiaries[pkh][assetName].redeemable.toString()}</div>
                                        <Button variant="outline" onClick={() => claim(beneficiaries[pkh][assetName].utxos)} >Claim</Button>

                                    </div>
                                    )
                                })}
                            </>
                        </CardContent>
                    </Card>

                )
            })}

        </div>
    )
}