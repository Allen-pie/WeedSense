import axios_cfg from './axios_cfg'

const SegmentAPI = {
    segment : async function(formData : FormData, mode : string){
        return await axios_cfg.request({
            url: mode == 'binary' ?  "/segment-binary" : "/segment-multi",
            method : 'POST',
            data : 
                formData
            ,
            headers : {
                "Content-Type": "multipart/form-data"
            }
        })
    }

}

export default SegmentAPI;