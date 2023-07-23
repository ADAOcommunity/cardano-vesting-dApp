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

const profileFormSchema = z.object({
    username: z
        .string()
        .min(2, {
            message: "Username must be at least 2 characters.",
        })
        .max(30, {
            message: "Username must not be longer than 30 characters.",
        }),
    email: z
        .string({
            required_error: "Please select an email to display.",
        })
        .email(),
    bio: z.string().max(160).min(4),
    urls: z
        .array(
            z.object({
                value: z.string().url({ message: "Please enter a valid URL." }),
            })
        )
        .optional(),
})


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
                            token: z.string(),
                            amount: z.number()
                        })
                    )
            })
        )
    }
)




type ProfileFormValues = z.infer<typeof profileFormSchema>
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
                    token: ""
                }
            ]
        }
    ]

}

export function ProfileForm() {
    const form = useForm<VestingFormValues>({
        resolver: zodResolver(vestingScheduleSchema),
        defaultValues,
        mode: "onChange",
    })

    const { fields, append, remove } = useFieldArray({
        name: "items",
        control: form.control,
    })

    function onSubmit(data: ProfileFormValues) {
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
        append({ beneficiary: "", schedule: [{ amount: 0, freeDate: new Date(), token: "" }] })
    }
    const removeBeneficiary = (e: any) => {
        e.preventDefault()
        remove()
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {fields.map((field, index) => (
                    <Card>
                        <div className="text-center m-2" >
                            <CardTitle title={`Beneficiary ${index}`} >
                                {`Beneficiary ${index}`}
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
                            <BeneficiarySchedule onRemove={removeBeneficiary} scheduleIndex={index} />
                        </CardContent>

                    </Card>
                ))}
                <div className="flex justify-between w-full">
                    <Button variant="secondary" onClick={addBeneficiary} >Add beneficiary</Button>
                    <Button type="submit">Create schedule</Button>
                </div>
            </form>
        </Form>
    )
}