function upload(req:any,res:any){
    return res.json({file_details:req.file,body_details:req.body});
};

export default upload;