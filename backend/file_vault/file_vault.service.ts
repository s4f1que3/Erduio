import { supabaseService } from "../supabase_service/supabase.service";
import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";

@Injectable()
export class vaultService {

    constructor(private readonly supabase: supabaseService){}

    async uploadFile (school_id: string, title: string, description: string, user_id: string, file: Express.Multer.File) {
        const path = `${school_id}/${user_id}/vault/${crypto.randomUUID()}`
        const {data: fdata, error: ferror} = await this.supabase.db.storage
        .from('file_vault')
        .upload(path, file.buffer, {contentType: file.mimetype})
        if(ferror) throw new InternalServerErrorException(ferror.message)

        const {data, error} = await this.supabase.db
        .from('File_Vault')
        .insert({
            title: title,
            description: description,
            file_path: path,
            user_id: user_id,
            school_id: school_id
        })

        if(error) throw new InternalServerErrorException(error.message)
        return data && fdata
    }

    async getFilePath (school_id: string, vault_id: string) {
        const {data, error} = await this.supabase.db
        .from('File_Vault')
        .select('file_path')
        .eq('school_id', school_id)
        .eq('id', vault_id)
        .single()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.file_path) throw new NotFoundException('file path not found for vault entry')
        return data.file_path
    }

    async deleteFile(school_id: string, vault_id: string) {
        const path = await this.getFilePath(school_id, vault_id)
        const {error: ferror} = await this.supabase.db.storage
        .from('file_vault')
        .remove(path as any)
        if(ferror) throw new InternalServerErrorException(ferror.message)

        const {error} = await this.supabase.db
        .from('File_Vault')
        .delete()
        .eq('school_id', school_id)
        .eq('id', vault_id)

        if(error) throw new InternalServerErrorException(error.message)
    }

    async getSignedUrl(school_id: string, vault_id: string) {
        const path = await this.getFilePath(school_id, vault_id)
        const {data, error} = await this.supabase.db.storage
        .from('file_vault')
        .createSignedUrl(path as string, 60 * 60)

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.signedUrl) throw new NotFoundException('signed URL not found')
        return data.signedUrl
    }

    async getAllFiles(school_id: string, user_id: string) {
        const {data, error} = await this.supabase.db
        .from('File_Vault')
        .select('*')
        .eq('school_id', school_id)
        .eq('user_id', user_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async downloadFile (school_id: string, vault_id: string) {
        const path = await this.getFilePath(school_id, vault_id)
        const {data, error} = await this.supabase.db.storage
        .from('file_vault')
        .download(path)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }
}