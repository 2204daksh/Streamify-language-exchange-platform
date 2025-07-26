import { generateStreamToken } from "../lib/stream.js";

// to genrate a stream token -> and visit the chat page
export async function getStreamToken(req,res){
    try{
        const token = generateStreamToken(req.user.id);

        res.status(200).json({ token });
    }
    catch(error){
        console.log("Error in getStreamToken controller", error.message);
        res.status(500).json({ message: "Internal Server error"})
    }
}