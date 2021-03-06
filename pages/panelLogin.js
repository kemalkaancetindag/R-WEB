import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";
import { ApiUrl } from "../helpers/appConstants";






export default function PanelLogin() {

  const router = useRouter()
  const [username,setUsername] = useState("")
  const [password,setPassword] = useState("")
  const [error,setError] = useState("")
  
  

  const login = async () => {
      try{
        const response =  await axios.get(`${ApiUrl}/user/get-user?username=${username}&password=${password}`)
        if(response.data.success){
          localStorage.setItem("user_token",response.data.data)
          router.push("/panel")
        }
        else{
          setError(response.data.error)
        }
      }
      catch(e){
        console.log(e.toString())
      }
      
  }

  return (
    <div className="flex justify-center" >  

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col w-1/4 mt-10">
        <div className="mb-4">
          <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="username">
            Kullanıcı Adı
          </label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker" id="analysis_code" type="text" placeholder="Kullanıcı Adı" onChange={(e) => setUsername(e.target.value)}/>
        </div>     
        <div className="mb-4">
          <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="username">
            Şifre
          </label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker" id="analysis_code" type="password" placeholder="Şifre" onChange={(e) => setPassword(e.target.value)}/>
        </div>
        <div className="flex items-center justify-between">
          <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" onClick={login}>
            Giriş Yap
          </button>


        </div>
      </div>

    </div>

  )
}
