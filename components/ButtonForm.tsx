import React from 'react'
import { useFormStatus } from 'react-dom';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

const ButtonForm = ( { children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    const { pending } = useFormStatus();

    return (
        <Button disabled={pending} type="submit" className="w-full gradient-primary border-0 text-primary-foreground flex items-center justify-center gap-1 shadow-md" {...props}>
            {children} {pending && <Loader2 className="animate-spin" />}
        </Button>
    )
}

export default ButtonForm
