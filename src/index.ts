import express from 'express';
import routes from './router/v1/routes.js';

const app=express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.get("/",(req,res)=>{
res.json({msg:"Hello from Request..."});
});
app.use("/api/v1",routes);

app.listen(PORT,()=>{
    console.log(`app is listen on port ${PORT}`);
});