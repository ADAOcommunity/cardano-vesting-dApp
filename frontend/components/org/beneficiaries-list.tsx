import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { calculateWithdrawablePeriods, tokenNameFromHex } from "@/utils/utils"
import { C, Constr, Data, UTxO, toHex } from "lucid-cardano"
import { Button } from "../ui/button"
import { useContext } from "react"
import { UserContext } from "@/pages/_app"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { VestingVesting } from "@/validators/plutus"

type Props = {
    beneficiaries: {
        [key: string]: { //beneficiary
            [key: string]: {  // asset name of vested token
                totalVested: bigint,
                withdrawablePeriods: number,
                redeemable: bigint,
                withdrawn: bigint,
                remaining: bigint,
                utxos: { datum: VestingVesting["datum"], utxo: UTxO }[]
            }
        }
    }
}
export default function BeneficiariesList({ beneficiaries }: Props) {
    const { lucid, user } = useContext(UserContext)
    console.log({ user })
    const validator = new VestingVesting()
    const claim = async (utxos: { datum: VestingVesting["datum"], utxo: UTxO }[]) => {
        if (lucid) {
            const myAddress = "addr_test1qrsaj9wppjzqq9aa8yyg4qjs0vn32zjr36ysw7zzy9y3xztl9fadz30naflhmq653up3tkz275gh5npdejwjj23l0rdquxfsdj"
            const myAddressDetails = lucid?.utils.getAddressDetails(myAddress)
            const stakeCredential = myAddressDetails?.stakeCredential
            const contractAddress = lucid!.utils.validatorToAddress(validator, stakeCredential)
            console.log({ utxos, validator, hash: lucid.utils.validatorToScriptHash(validator), addr: lucid.utils.validatorToAddress(validator) })
            const redeemer = Data.to(new Constr(0, []))
            console.log({ redeemer })
            let tx = lucid.newTx()
            let beneficiaryAddress = lucid.utils.credentialToAddress(lucid.utils.keyHashToCredential(utxos[0].datum.beneficiary))
            let totalToBeneficiary = BigInt(0)
            for (let utxo of utxos) {
                const assetName = utxo.datum.tokenPolicyId + utxo.datum.tokenName
                const beaconName = utxo.datum.beaconToken + utxo.datum.orgToken
                const tokensInUtxo = BigInt(utxo.utxo.assets[assetName])
                const withdrawablePeriods = calculateWithdrawablePeriods(utxo.datum.periodLength, utxo.datum.date)
                const withdrawableAmount = BigInt(withdrawablePeriods) * utxo.datum.amountPerPeriod
                totalToBeneficiary += withdrawableAmount
                const change = tokensInUtxo - withdrawableAmount
                console.log({ change })
                tx = tx.payToContract(contractAddress, { inline: Data.to(utxo.datum, VestingVesting.datum) /* Data.to(utxo.datum, VestingVesting.datum) */ }, { [assetName]: change, [beaconName]: BigInt(1) })
            }
            tx = tx.collectFrom(utxos.map(utxoData => utxoData.utxo), redeemer)
                .payToAddress(beneficiaryAddress, { [utxos[0].datum.tokenPolicyId + utxos[0].datum.tokenName]: totalToBeneficiary })
                .validFrom(Date.now() - 60000)
                .validTo(Date.now() + 1000 * 60)
                .addSigner(user.address)
                .attachSpendingValidator(validator)
            console.log(await tx.toString())
            const txComplete = await tx
                .complete()
            const signedTx = await txComplete.sign().complete()
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
                                        <>
                                            {
                                                user.addressesAndPkhs.some((i: { address: string, pkh: string }) => i.pkh == pkh)
                                                && <Button variant="outline" onClick={() => claim(beneficiaries[pkh][assetName].utxos)} >Claim</Button>
                                            }
                                        </>
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