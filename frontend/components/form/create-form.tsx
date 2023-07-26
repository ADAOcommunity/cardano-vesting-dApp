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


const vestingScheduleSchema = z.object(
    {
        items: z.array(
            z.object({
                beneficiary: z
                    .string()
                    .min(2, {
                        message: "Address must be specified",
                    })
                    .max(30, {
                        message: "Username must not be longer than 30 characters.",
                    }),
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
    date: Date
    token: string
    amount: number
}

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

export function ProfileForm() {
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

    function onSubmit(data: VestingFormValues) {
        console.log("submit")
        const formattedValues = formatValues(data)
        console.log({ formattedValues })
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
            for (let schedule of item.schedule) {
                const val = {
                    beneficiary: item.beneficiary,
                    date: schedule.freeDate,
                    token: schedule.token,
                    amount: schedule.amount,
                }
                if (schedule.periodical) {
                    for (let i = 0; i < schedule.periods!; i++) {
                        formatted.push({
                            ...val,
                            date: new Date(val.date.getTime() + schedule.periodLength! * 86400000)
                        })
                    }
                } else {
                    formatted.push(val)
                }
            }
        })
        return formatted
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