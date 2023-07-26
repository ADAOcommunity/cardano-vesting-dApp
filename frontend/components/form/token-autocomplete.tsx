import {
    Cloud,
    CreditCard,
    Github,
    Keyboard,
    LifeBuoy,
    LogOut,
    Mail,
    MessageSquare,
    Plus,
    PlusCircle,
    Settings,
    User,
    UserPlus,
    Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "../ui/input"
import { useContext, useEffect, useRef, useState } from "react"
import { UserContext } from "@/pages/_app"
import { getAssetsFromStakeAddress } from "@/utils/utils"
import { FormControl, FormDescription, FormLabel, FormMessage } from "../ui/form"

export function TokenAutocomplete({ field, setValue }: any) {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const { lucid } = useContext(UserContext)
    const [tokens, setTokens] = useState<any[]>([])
    const [filteredTokens, setFilteredTokens] = useState<any[]>([])
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (lucid) {
            getAssetsFromStakeAddress(lucid).then((assets) => {
                console.log({ assets })
                setTokens(assets)
                setFilteredTokens(assets)
            })
        }
    }, [lucid])

    const filterTokens = (value: string) => {
        if (setFilteredTokens.length > 0) {
            if (!isOpen) {
                setIsOpen(true)
            }

            console.log({ value })
            const filtered = tokens.filter((token) => token.assetName.toLowerCase().includes(value.toLowerCase()))
            console.log({ filtered })
            setFilteredTokens(filtered)
        }
    }

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus()
        }
    }, [isOpen])

    return (
        <DropdownMenu open={isOpen} modal={false}  >
            <DropdownMenuTrigger className="text-left" onClick={(e) => e.preventDefault()} >
                {/* <Button variant="outline">Open</Button> */}
                    <FormLabel >Token</FormLabel>
                    <FormControl  className="mt-2">
                        <Input onClick={() => setIsOpen(true)} ref={inputRef} /* onClick={()=>setIsOpen(!isOpen)} */ onInput={(e) => filterTokens(e.target.value)} placeholder="Enter token name" {...field} />

                    </FormControl>
                   
            </DropdownMenuTrigger>

            <DropdownMenuContent onInteractOutside={() => setIsOpen(false)} className="w-56">
                {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
                {/* <DropdownMenuSeparator /> */}
                <DropdownMenuGroup>
                    {
                        filteredTokens.map((token) =>
                            <DropdownMenuItem key={token.unit} onClick={() => { setIsOpen(false); setValue(token.unit) }} >
                                {/* <User className="mr-2 h-4 w-4" /> */}
                                <span>{token.assetName}</span>
                                {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
                            </DropdownMenuItem>
                        )
                    }
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
