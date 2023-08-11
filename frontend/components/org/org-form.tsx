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
import { Card, CardContent, CardTitle } from "../ui/card"
import { useContext, useEffect } from "react"
import { UserContext } from "@/pages/_app"
import { getAssetsFromStakeAddress } from "@/utils/utils"
import { Constr, Data, SpendingValidator, fromHex, toHex } from "lucid-cardano"
import { OrgTokenOrgToken, VestingVesting } from "@/validators/plutus"
// import { validator } from "@/validators/validator"



const createOrgSchema = z.object(
    {
        items: z.array(
            z.string().min(2, {
                message: "Address must be specified",
            }),
        )
    }
)


type OrgFormValues = z.infer<typeof createOrgSchema>

// This can come from your database or API.
const defaultValues: Partial<OrgFormValues> = {
    items: []
}

export function OrgForm() {
    const { lucid } = useContext(UserContext)

    const form = useForm<OrgFormValues>({
        resolver: zodResolver(createOrgSchema),
        defaultValues,
        mode: "onChange",
    })

    const { fields, append, remove } = useFieldArray({
        name: "items",
        control: form.control,
    })

    async function onSubmit(data: OrgFormValues) {
        console.log("submit")
        console.log({data})
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

    const addOrgMember = (e: any) => {
        e.preventDefault()
        append("")
    }
    const removeOrgMember = (e: any, index: number) => {
        e.preventDefault()
        remove(index)
    }


    const createTx = async (values: OrgFormValues) => {
        const utxos = await lucid?.wallet.getUtxos()
        const utxo = utxos![0]
        const name = toHex(Buffer.from("orgToken", "utf8"))
        console.log({utxo})
        const validator = new OrgTokenOrgToken(name, { transactionId: { hash: utxo.txHash }, outputIndex: BigInt(utxo.outputIndex) })
        const policyId = lucid!.utils.mintingPolicyToId(validator)
        console.log({policyId})
        const contractAddress = lucid!.utils.validatorToAddress(validator)
        const mintRedeemer = Data.to(new Constr(0, []));
        let tx = lucid!.newTx()
        .collectFrom([utxo])
        for(let address of values.items) {
            tx = tx.payToAddress(address, {[policyId+name]: BigInt(1)})
        }
        tx = tx.attachMintingPolicy(validator)
        .mintAssets({[policyId+name]: BigInt(values.items.length)}, mintRedeemer)
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
                            <CardTitle title={`Org member ${index}`} >
                            </CardTitle>
                        </div>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name={`items.${index}`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Org Member</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter address..." {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Address of the org member
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button variant="secondary" onClick={(e) => removeOrgMember(e, index)} >Remove Member</Button>
                        </CardContent>
                    </Card>
                ))}
                <div className="flex justify-between w-full">
                    <Button variant="secondary" onClick={addOrgMember} >Add Member</Button>
                    <Button onClick={() => console.log(form.formState.isValid)} type="submit">Create schedule</Button>
                </div>
            </form>
        </Form>
    )
}