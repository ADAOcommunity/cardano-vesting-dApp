import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { BeneficiarySchedule } from "./schedule-form"
import { Card, CardContent, CardTitle } from "../ui/card"
import { useContext, useEffect } from "react"
import { UserContext } from "@/pages/_app"
import { evenDigits, getAssetsFromStakeAddress } from "@/utils/utils"
import { Constr, Data, SpendingValidator, fromHex, toHex } from "lucid-cardano"
import { BeaconBeaconToken, VestingVesting } from "@/validators/plutus"
import { useRouter } from "next/router"
// import { validator } from "@/validators/validator"



const vestingScheduleSchema = z.object(
    {
        items: z.array(
            z.object({
                beneficiary: z
                    .string()
                    .min(2, {
                        message: "Address must be specified",
                    }),
                /*  .max(30, {
                     message: "Username must not be longer than 30 characters.",
                 }), */
                schedule: z
                    .array(
                        z.object({
                            freeDate: z.date(),
                            token: z.string().min(2, {
                                message: "Address must be specified",
                            }),
                            periodical: z.boolean(),
                            periods: z.number().min(1, { message: "Periods must be greater than 0" }).optional(),
                            periodLength: z.number().min(0, { message: "Period length must be greater than 0" }).optional(),
                            amount: z.number().min(0.1, { message: "Amount must be greater than 0" })
                        })
                    )
            })
        )
    }
)


type FormattedSchedule = {
    beneficiary: string
    date: bigint,
    token_name: string
    amount: number
    tokens_required: number
    token_policy_id: string
    period_length: number
    periods: number
}
/* const Datum = Data.Object({
    beneficiary: Data.String,
    date: Data.BigInt,
});
type Datum = Data.Static<typeof Datum>; */
type VestingFormValues = z.infer<typeof vestingScheduleSchema>

// This can come from your database or API.
const defaultValues: Partial<VestingFormValues> = {
    items: [
        {
            beneficiary: "",
            schedule: [
                {
                    amount: 0,
                    freeDate: new Date(),
                    periods: 1,
                    periodical: true,
                    periodLength: 0,
                    token: ""
                }
            ]
        }
    ]

}

export function VestingForm() {
    const validator = new VestingVesting()
    const { lucid } = useContext(UserContext)
    
    const router = useRouter()
    const { orgPolicy } = router.query

    const form = useForm<VestingFormValues>({
        resolver: zodResolver(vestingScheduleSchema),
        defaultValues,
        mode: "onChange",
    })

    const { fields, append, remove } = useFieldArray({
        name: "items",
        control: form.control,
    })

    async function onSubmit(data: VestingFormValues) {
        console.log("submit")
        const txHash = await createTx(data)
        console.log({ txHash })
        toast({
            title: "You submitted the following values:",
            description: (
                <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                    <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                </pre>
            ),
        })
    }

    const addBeneficiary = (e: any) => {
        e.preventDefault()
        append({ beneficiary: "", schedule: [{ amount: 0, freeDate: new Date(), token: "", periodical: true, periodLength: 0, periods: 1 }] })
    }
    const removeBeneficiary = (e: any, index: number) => {
        e.preventDefault()
        remove(index)
    }
    const duplicateIndex = (e: any, index: number) => {
        e.preventDefault()
        const indexValues = form.getValues(`items.${index}`)
        append({ ...indexValues, beneficiary: "" })
    }

    useEffect(() => {
        if (lucid) {
            getAssetsFromStakeAddress(lucid)
            lucid.wallet?.address().then((addy) => {
                console.log({ addy })
            })
        }
    }, [lucid])

    const formatValues = (values: VestingFormValues) => {
        const formatted: FormattedSchedule[] = []
        values.items.forEach((item) => {

            const pkh = lucid!.utils.getAddressDetails(item.beneficiary).paymentCredential!.hash //lucid!.utils.paymentCredentialOf(item.beneficiary).hash
            for (let schedule of item.schedule) {
                console.log({ schedule })
                let val = {
                    beneficiary: pkh,//item.beneficiary,
                    date: BigInt(schedule.freeDate.getTime()),
                    token_name: schedule.token.slice(56),
                    amount: schedule.amount,
                    tokens_required: 1, //org tokens required to unlock
                    token_policy_id: schedule.token.slice(0, 56),
                    period_length: 0,
                    periods: 1
                }
                if (schedule.periodical) {
                    val["period_length"] = schedule.periodLength || 0
                    val["periods"] = schedule.periods || 0
                }
                formatted.push(val)

            }
        })
        return formatted
    }

    const createTx = async (values: VestingFormValues) => {
        const myAddress = "addr_test1qrsaj9wppjzqq9aa8yyg4qjs0vn32zjr36ysw7zzy9y3xztl9fadz30naflhmq653up3tkz275gh5npdejwjj23l0rdquxfsdj"
        const myAddressDetails = lucid?.utils.getAddressDetails(myAddress)
        const stakeCredential = myAddressDetails?.stakeCredential
        const contractAddress = lucid!.utils.validatorToAddress(validator, stakeCredential)
        const validatorHash = lucid!.utils.validatorToScriptHash(validator)
        const beaconPolicy = new BeaconBeaconToken(validatorHash, stakeCredential!.hash )
        const beaconPolicyId = lucid!.utils.mintingPolicyToId(beaconPolicy)
        const mintRedeemer = Data.to(new Constr(0, []));
        const formatted = formatValues(values)
        const utxos = await lucid?.utxosAt(await lucid.wallet.address())
        const utxo = utxos![0]
        const beaconName = orgPolicy//Buffer.from(orgPolicy as string, "hex").toString("hex") //toHex(Buffer.from("caca", "utf8"))//toHex(Buffer.from(beaconPolicyId, "utf8"))
        console.log({beaconName})
        console.log({ formatted })
        let tx = lucid?.newTx()
        .collectFrom([utxo])
        .attachMintingPolicy(beaconPolicy)
        for (let receiver of formatted) {
            // const {amount, token, ...rest} = receiver // remove the "amount" property from the receiver object
            const d: VestingVesting["datum"] = {
                datumId: utxo.txHash+evenDigits(utxo.outputIndex),
                beneficiary: receiver.beneficiary,
                date: BigInt(receiver.date),
                tokensRequired: BigInt(receiver.tokens_required),
                orgToken: orgPolicy as string,
                beaconToken: beaconPolicyId,
                numPeriods: BigInt(receiver.periods),
                periodLength: BigInt(receiver.period_length),
                amountPerPeriod: BigInt(receiver.amount),
                tokenPolicyId: receiver.token_policy_id,
                tokenName: receiver.token_name,
            }
            /* console.log({ d })
            const datumVals = Object.values(d)
            console.log({datumVals})    
            const datum = Data.to(new Constr(0,datumVals)) */

            const datum = Data.to(d, VestingVesting.datum)

            
            tx = tx!.payToContract(contractAddress, { inline: datum }, { [receiver.token_policy_id+receiver.token_name]: BigInt(receiver.amount!*receiver.periods), [beaconPolicyId+orgPolicy]: BigInt(1) })
        }
        tx= tx?.mintAssets({[beaconPolicyId+orgPolicy]: BigInt(formatted.length)}, mintRedeemer)
        console.log(await tx?.toString())
        const txComplete = await tx?.complete()
        const signedTx = await txComplete?.sign().complete()
        const txHash = await signedTx?.submit()
        return txHash
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {fields.map((field, index) => (
                    <Card className="border-2" key={field.id} >
                        <div className="text-center m-2" >
                            <CardTitle title={`Beneficiary ${index}`} >
                                <div className="flex flex-row space-x-4 justify-center">
                                    <> {`Beneficiary ${index}`}</>
                                    <Button onClick={(e) => duplicateIndex(e, index)} variant="link" >Clone</Button>
                                </div>
                            </CardTitle>
                        </div>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name={`items.${index}.beneficiary`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Beneficiary</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter address..." {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Address of the beneficiary
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <BeneficiarySchedule onRemove={(e) => removeBeneficiary(e, index)} scheduleIndex={index} />
                        </CardContent>

                    </Card>
                ))}
                <div className="flex justify-between w-full">
                    <Button variant="secondary" onClick={addBeneficiary} >Add beneficiary</Button>
                    <Button onClick={() => console.log(form.formState.isValid)} type="submit">Create schedule</Button>
                </div>
            </form>
        </Form>
    )
}