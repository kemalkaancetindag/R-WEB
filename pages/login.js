import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";






export default function Login() {

  const router = useRouter()
  const [analysisCode, setAnalysisCode] = useState("");
  const [error,setError] = useState()
  

  const login = async () => {
    
    const response = await axios.get(`http://localhost:3002/api/analysis/analysis-token?analysis_code=${analysisCode}`)
    console.log(response)

    if(response.data.success){
      localStorage.setItem("token",response.data.data)
      router.push("/analysis")
    }
    else{
      setError(response.error)
    }
    
  
    
   
  }

  return (
    <div className="flex justify-center" >  

      <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col w-1/4 mt-10">
        <div class="mb-4">
          <label class="block text-grey-darker text-sm font-bold mb-2" for="username">
            Analiz Kodu
          </label>
          <input class="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker" id="analysis_code" type="text" placeholder="c4dc826095......." onChange={(e) => setAnalysisCode(e.target.value)}/>
        </div>     
        <div class="flex items-center justify-between">
          <button class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" onClick={login}>
            Analize Git
          </button>


        </div>
      </div>

    </div>

  )
}
