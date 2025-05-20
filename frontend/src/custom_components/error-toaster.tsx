import { toast } from "sonner";
import {AlertTriangle } from "lucide-react";


interface Props {
    title? : string;
    description? : string;
}

export default function showErrorToaster ({title = 'Error', description = ''} : Props){
    toast.custom((t) => (
        <div className="flex items-center gap-3 p-4 bg-red-500 text-white rounded-md shadow-lg w-[350px]">
            <AlertTriangle className="w-5 h-5 text-white" />
            <div className="bg-red-500 ml-1">
                <p className="font-semibold text-white">{title}</p>
                <p className="text-sm text-white">{description}</p>
            </div>
        </div>
    ))
    
}