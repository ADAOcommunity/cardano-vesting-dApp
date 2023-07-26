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
import { getAssetsFromStakeAddress } from "@/utils/utils"
import {  Data, SpendingValidator, fromHex, toHex } from "lucid-cardano"

const scriptCbor = "59021b0100003232323232323232323232322223253330093232533300b3370e900100089919918008009129998090008a5113232533301000213300400400114a0602c00466e1d20023010375460280026602266601866646444660066eb0cc030c03800920100013001001222533301300214a026464a66602266e3c00800c5288999802802800801980b8019bae301500233008300a00548000dd719804180500224004980103d87a80004c0103d87980003301133300c3322323253330103370e90010008991919b89005001375a602e002601c0042940c038004cc028c030cc028c030009200048000cc020c028cc020c028015200048038dd69980418050022400098103d87a80004c0103d87980004bd7018048010a5030090013300530070024800852616320043253330093370e900000089919191919191919299980a980c0010a4c2a66024921334c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2065787065637465640016375c602c002602c0046eb4c050004c050008dd7180900098090011bad30100013007004153300a49012b436f6e73747220696e64657820646964206e6f74206d6174636820616e7920747970652076617269616e740016300700333001001480008888cccc01ccdc38008018069199980280299b8000448008c03c0040080088c018dd5000918021baa0015734ae7155ceaab9e5573eae815d0aba21"
const validator: SpendingValidator  =  {
    type: "PlutusV2",
    script: scriptCbor,
  }

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
    date: number,
    token: string
    amount: number
}
/* const Datum = Data.Object({
    beneficiary: Data.Literal(),
    date: Data.Integer(),
    token: Data.String,
    amount: Data.BigInt,
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
                    periodical: false,
                    periodLength: 0,
                    token: ""
                }
            ]
        }
    ]

}

export function VestingForm() {
    const { lucid } = useContext(UserContext)

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
        append({ beneficiary: "", schedule: [{ amount: 0, freeDate: new Date(), token: "", periodical: false, periodLength: 0 }] })
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
            const pkh = lucid!.utils.paymentCredentialOf(item.beneficiary).hash
            for (let schedule of item.schedule) {
                const val = {
                    beneficiary: pkh,//item.beneficiary,
                    date: schedule.freeDate.getTime(),
                    token: schedule.token,
                    amount: schedule.amount,
                }
                if (schedule.periodical) {
                    for (let i = 0; i < schedule.periods!; i++) {
                        formatted.push({
                            ...val,
                            date: new Date(Number(val.date) + schedule.periodLength! * 86400000).getTime()
                        })
                    }
                } else {
                    formatted.push(val)
                }
            }
        })
        return formatted
    }

    const createTx = async (values: VestingFormValues) => {
        const contractAddress=lucid!.utils.validatorToAddress(validator)

        const formatted = formatValues(values)
        console.log({ formatted })
        let tx = lucid?.newTx()
        for (let receiver of formatted) {
            const datum = Data.to(
                Data.fromJson(receiver)
            );
            tx!.payToContract(contractAddress, { inline: datum }, { [receiver.token]: BigInt(receiver.amount) })
        }
        const txComplete = await tx?.complete()
        const signedTx = await txComplete?.sign().complete()
        const txHash= await signedTx?.submit()
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