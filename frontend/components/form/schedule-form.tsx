import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm, useFormContext } from "react-hook-form"
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
import { toast } from "@/components/ui/use-toast"
import { Calendar } from "../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"



type Props = {
    scheduleIndex: number
}

export function BeneficiarySchedule({ scheduleIndex }: Props) {
    const form = useFormContext()
    const { fields, append, remove } = useFieldArray({
        name: `items.${scheduleIndex}.schedule`,
        control: form.control,
    })
    const values = form.watch()
    console.log({values})
    return (
        <>
            {fields.map((field, index) => (
                <>
                    <FormField
                        control={form.control}
                        name={`items.${scheduleIndex}.schedule.${index}.amount`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amount</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter address..." {...field} />
                                </FormControl>
                                <FormDescription>
                                    Amount to unlock
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`items.${scheduleIndex}.schedule.${index}.token`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Token</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter address..." {...field} />
                                </FormControl>
                                <FormDescription>
                                    Token name
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`items.${scheduleIndex}.schedule.${index}.freeDate`}
                        render={({ field }) => (
                            <FormItem>
                               <> {console.log({field})}</>
                                <FormLabel>Unlock date</FormLabel>
                                <FormControl>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-[280px] justify-start text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={new Date()}
                                                onSelect={(e)=>form.setValue(field.name, e)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </FormControl>
                                <FormDescription>
                                    Date to unlock tokens
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </>


            ))}
        </>)
}