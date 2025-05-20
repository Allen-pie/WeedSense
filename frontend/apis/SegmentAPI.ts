import axios_cfg from './axios_cfg'

const SegmentAPI = {
    segment : async function(formData : FormData){
        return await axios_cfg.request({
            url: "/segment-image",
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