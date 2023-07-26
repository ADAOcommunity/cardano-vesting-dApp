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
import { Separator } from "../ui/separator"
import { Card, CardContent } from "../ui/card"
import { Switch } from "../ui/switch"
import { Label } from "../ui/label"
import { TokenAutocomplete } from "./token-autocomplete"



type Props = {
    scheduleIndex: number,
    onRemove: (e: any) => void
}

export function BeneficiarySchedule({ scheduleIndex, onRemove }: Props) {
    const form = useFormContext()
    const { fields, append, remove } = useFieldArray({
        name: `items.${scheduleIndex}.schedule`,
        control: form.control,
    })
    const values = form.watch()
    console.log({ values })

    const addBeneficiarySchedule = (e: any) => {

        e.preventDefault()
        append({ amount: 0, token: "", freeDate: new Date() })

    }
    const removeBeneficiarySchedule = (e: any, index: number) => {
        e.preventDefault()
        remove(index)
    }
    return (
        <>
            {fields.map((field, index) => (
                <Card key={field.id} className="my-2" >
                    <>{console.log({ field })}</>
                    <CardContent className="flex flex-col space-y-4 " >
                        <div className="flex flex-row space-x-4 justify-even items-center">
                            <FormField
                                control={form.control}
                                name={`items.${scheduleIndex}.schedule.${index}.token`}
                                render={({ field }) => (
                                    <FormItem>
                                        <TokenAutocomplete field={field} setValue={(val: string) => form.setValue(`items.${scheduleIndex}.schedule.${index}.token`, val)} />
                                        {/* <Input placeholder="Enter token name" {...field} /> */}
                                        <FormDescription>
                                            Token name
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`items.${scheduleIndex}.schedule.${index}.amount`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <Input value={form.getValues(`items.${scheduleIndex}.schedule.${index}.amount`)} onChange={(e) => form.setValue(`items.${scheduleIndex}.schedule.${index}.amount`, Number(e.target.value))} type="number" placeholder="Enter amount..." />
                                        </FormControl>
                                        <FormDescription>
                                            Amount to unlock
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex flex-row space-x-2 justify-even items-center">
                            <FormField
                                control={form.control}
                                name={`items.${scheduleIndex}.schedule.${index}.freeDate`}
                                render={({ field }) => (
                                    <FormItem>
                                        {/* <> {console.log({ field })}</> */}
                                        <FormLabel>Unlock start date: </FormLabel>
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
                                                        onSelect={(e) => form.setValue(field.name, e)}
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
                            <FormField
                                control={form.control}
                                name={`items.${scheduleIndex}.schedule.${index}.periodical`}
                                render={({ field }) => (
                                    <FormItem>
                                        {/* <FormLabel>Periodical?</FormLabel> */}
                                        <FormControl>
                                            <div className="flex items-center space-x-2">
                                                <Switch onCheckedChange={(e) => form.setValue(`items.${scheduleIndex}.schedule.${index}.periodical`, e)} id="periodical" />
                                                <Label htmlFor="airplane-mode">Periodical</Label>
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Is the schedule periodical or on a specific date?
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />



                        </div>
                        {form.getValues(`items.${scheduleIndex}.schedule.${index}.periodical`) &&
                            <div className="flex flex-row space-x-2 justify-even items-center">
                                <FormField
                                    control={form.control}
                                    name={`items.${scheduleIndex}.schedule.${index}.periodLength`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Frequency (days)</FormLabel>
                                            <FormControl>
                                                <Input onChange={(e) => form.setValue(`items.${scheduleIndex}.schedule.${index}.periodLength`, Number(e.target.value))} type="number" placeholder="Enter frequency in days..." />
                                            </FormControl>
                                            <FormDescription>
                                                How often will this amount be released?
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`items.${scheduleIndex}.schedule.${index}.periods`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Periods</FormLabel>
                                            <FormControl>
                                                <Input onChange={(e) => form.setValue(`items.${scheduleIndex}.schedule.${index}.periods`, Number(e.target.value))} type="number" placeholder="Enter number of periods" />
                                            </FormControl>
                                            <FormDescription>
                                                How many periods will this amount be released?
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        }
                        <Button size={"sm"} className="mt-4 w-1/2 self-center" variant="destructive" onClick={(e) => removeBeneficiarySchedule(e, index)} >Remove trench</Button>

                    </CardContent>
                </Card>
            ))}
            <div className="flex justify-between w-full">
                <Button variant="secondary" onClick={addBeneficiarySchedule} >Add schedule trench</Button>
                <Button variant="destructive" onClick={onRemove} >Remove Beneficiary</Button>
            </div>
        </>)
}