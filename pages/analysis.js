import axios from "axios";
import { useRouter } from "next/router";
import _ from "lodash"
import jwt from "jsonwebtoken"

import { useEffect, useState } from "react";
import * as XLSX from 'xlsx/xlsx.mjs';
import { ApiStaticUrl, ApiUrl } from "../helpers/appConstants";



export default function Analysis() {

    const [isMultiple, setIsMultiple] = useState(false)
    const [analysis, setAnalysis] = useState()
    const [prediction, setPrediction] = useState()
    const [multiplePrediction, setMultiplePrediction] = useState()
    const [predictionIndex, setPredictionIndex] = useState(null)
    const [analysisCode, setAnalysisCode] = useState()
    const [totalPage,setTotalPage] = useState()
    const [currentPage, setCurrentPage] = useState(0)
    const router = useRouter()


    useEffect(async () => {
        const token = localStorage.getItem("token")
        
        if (token) {
            var decoded_token = jwt.verify(token, 'secret');
            console.log(decoded_token)
            
            try {
                var response = await axios.get(`${ApiUrl}/analysis/get-analysis?analysis_code=${decoded_token.analysis_code}`)
                setAnalysisCode(decoded_token.analysis_code)
                setAnalysis(response.data)
            }
            catch (e) {
                console.log(e.toString())
            }
        }
        else {
            router.push("/login")
        }






    }, [])

    const toggleDropdown = (e) => {
        var dropdownList = Array.from(document.getElementsByClassName("can-toggle"));
        dropdownList.forEach((el) => {
            if (el.id.split("-")[2] === e.currentTarget.getAttribute("data-collapse-toggle")) {
                if (!el.classList.contains("hidden")) {
                    el.classList.add("hidden")
                }
                else {
                    el.classList.remove("hidden")
                }
            }
        })
    }

    const handleModal = (e) => {
        e.preventDefault()                                                
        if (document.getElementById("defaultModal").classList.contains("hidden")) {                                    
            document.getElementById("defaultModal").classList.remove("hidden")
        }
        else {
            setPredictionIndex(null)
            document.getElementById("defaultModal").classList.add("hidden")
        }

    }

    const checkIsMultiple = (e) => {
        var file = e.currentTarget.files[0]
        if (file) {
            setPrediction(null)
            setIsMultiple(true)
        }
    }

    const removeMultiple = (e) => {
        setMultiplePrediction(null)
        setPrediction(null)
        document.getElementById("multiple-prediction").value = ""
        setIsMultiple(false)
        
        
    }

    const _sendPredictionDataCallback = async (data) => {
        var response = await axios.post(`${ApiUrl}/analysis/get-multiple-prediction?analysis_code=${analysisCode}`, { data: data })
        setTotalPage(Math.ceil(response.data.predictions.length/10))
        console.log(response.data)

        setMultiplePrediction(response.data)

    }

    const makePrediction = async (e) => {
        e.preventDefault()
        console.log(analysis)

        var prediction_data = {}
        var file = document.getElementById("multiple-prediction").files[0]





        try {
            if (file) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var workbook = XLSX.read(e.target.result, {
                        type: 'binary'
                    });
                    var sheet = workbook.Sheets[workbook.SheetNames[0]]
                    const inputs = XLSX.utils.sheet_to_json(sheet, { header: 1 })
                    prediction_data["inputs"] = inputs
                    prediction_data["is_multiple"] = true
                    _sendPredictionDataCallback(prediction_data)
                };
                reader.onerror = function (e) {
                    // error occurred
                    console.log('Error : ' + e.type);
                };
                reader.readAsBinaryString(file);
            }
            else {

                var inputs = []
                var num_inputs = document.querySelectorAll('[my-data-type="num"]');
                var cat_inputs = document.querySelectorAll('[my-data-type="cat"]');
                num_inputs.forEach(num_input => {
                    prediction_data[num_input.getAttribute("var-name")] = num_input.value

                })
                cat_inputs.forEach(cat_input => {
                    prediction_data[cat_input.getAttribute("var-name")] = cat_input.value
                })
                
                var response = await axios.post(`${ApiUrl}/analysis/get-prediction?analysis_code=${analysisCode}`, { data: prediction_data })

                setPrediction(response.data)
            }



        }
        catch (e) {
            console.log(e.toString())
        }
    }



    return (
        <>
            {
                analysis && analysis.is_model_ready ? (
                    <div className="grid grid-rows-12 grid-cols-12" >
                        <aside className="col-span-2 row-span fixed" aria-label="Sidebar">
                            <div className="overflow-y-auto py-4 px-3 bg-gray-50  dark:bg-gray-800" style={{ height: "100vh" }}>
                                <div className="flex items-center pl-2.5 mb-5">
                                    <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Değişkenler</span>
                                </div>
                                {analysis && analysis.independent_variables.map((value, index) => {
                                    return (
                                        <ul className="space-y-2" key={index}>

                                            <li>
                                                <button type="button" className="flex items-center p-2 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700" aria-controls="dropdown-example" data-collapse-toggle={index} onClick={(e) => toggleDropdown(e)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                                                        width="30px" height="30px" viewBox="0 0 100 100" enableBackground="new 0 0 100 100" xmlSpace="preserve">
                                                        <path fill="#FFF" d="M70.9,39.7c3.1,0,9.1-2.5,9.1-10.6c0-8.1-5.8-8.5-7.6-8.5c-3.6,0-7.1,2.6-10.2,7.9C59.1,34,55.6,40,55.6,40
                                    l-0.1,0c-0.8-3.8-1.4-7-1.7-8.4C53.2,28.3,49.3,21,41.3,21c-8,0-15.3,4.6-15.3,4.6l0,0c-1.4,0.9-2.3,2.4-2.3,4.1
                                    c0,2.7,2.2,4.9,4.9,4.9c0.8,0,1.5-0.2,2.1-0.5l0,0c0,0,6.1-3.4,7.4,0c0.4,1,0.7,2.2,1.1,3.4c1.6,5.2,3,11.4,4.2,17l-5.2,7.6
                                    c0,0-5.9-2.1-9-2.1S20,62.5,20,70.6s5.8,8.5,7.6,8.5c3.6,0,7.1-2.6,10.2-7.9c3.1-5.5,6.6-11.5,6.6-11.5c1,5,1.9,9,2.4,10.6
                                    c2,5.7,6.6,9.1,12.7,9.1c0,0,6.3,0,13.7-4.2c1.8-0.7,3.1-2.5,3.1-4.5c0-2.7-2.2-4.9-4.9-4.9c-0.8,0-1.5,0.2-2.1,0.5l0,0
                                    c0,0-5.3,3-7.1,0.6c-1.3-2.5-2.4-5.7-3.2-9.7c-0.8-3.6-1.7-7.8-2.5-11.9l5.3-7.7C61.9,37.6,67.8,39.7,70.9,39.7z"/>
                                                    </svg>
                                                    <span className="flex-1 ml-3 text-left whitespace-nowrap" sidebar-toggle-item>{value.name}</span>
                                                    <svg sidebar-toggle-item className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                                                </button>
                                                <ul id={`dropdown-example-${index}`} className="py-2 space-y-2 can-toggle">

                                                    <li>
                                                        <a href="#" className="flex items-center p-2 pl-11 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">Tip: {value.type}</a>
                                                    </li>
                                                </ul>
                                            </li>

                                        </ul>
                                    )
                                })}



                            </div>
                        </aside>

                        <div className=" col-start-4 col-span-8 row-start-1 mt-10 ">
                            <div className="flex justify-start mb-10">
                                <h2 className="font-bold text-2xl">Analiz</h2>
                            </div>
                            <div className="flex justify-start mb-10">
                                <div>
                                    <div className="flex justify-center">
                                        <div className="mb-3 w-96">
                                            <label htmlFor="formFile" className="form-label inline-block mb-2 text-gray-700">Birden fazla tahmin girdisi</label>
                                            <input className="form-control
                                            block
                                            w-full
                                            px-3
                                            py-1.5
                                            text-base
                                            font-normal
                                            text-gray-700
                                            bg-white bg-clip-padding
                                            border border-solid border-gray-300
                                            rounded
                                            transition
                                            ease-in-out
                                            m-0
                                            focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" type="file" id="multiple-prediction" onChange={(e) => checkIsMultiple(e)} />
                                        </div>
                                    </div>

                                </div>

                                {isMultiple ? (<button className="flex items-center" onClick={removeMultiple}>
                                    <img src="/cancel.png" className="w-4 h-4 ml-4 mt-2" />
                                </button>) : null}


                            </div>
                            <div className="py-4 mt-10 mb-10">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>

                            <form className="w-full ">
                                <div className="flex flex-wrap -mx-3 mb-6">
                                    {analysis && analysis.independent_variables.map((value, key) => {
                                        if (!value.is_categoric) {
                                            return (
                                                <div className="w-1/4  px-3 mb-6 md:mb-0 ">
                                                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-first-name">
                                                        {value.name}
                                                    </label>
                                                    <input className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white" id="grid-first-name" type="text" my-data-type="num" var-name={value.name} />
                                                </div>
                                            )
                                        }
                                    })}



                                </div>
                                <div className="flex flex-wrap -mx-3 mb-6">
                                    {analysis && analysis.independent_variables.map((value, key) => {
                                        if (value.is_categoric) {

                                            return (
                                                <div className="w-1/4  mb-6 md:mb-0 px-3">
                                                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-state">
                                                        {value.name}
                                                    </label>
                                                    <div className="relative">
                                                        <select my-data-type="cat" className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-state" var-name={value.name}>
                                                            {value.categories.map((value, key) => {
                                                                return (
                                                                    <option key={key}>{value}</option>
                                                                )
                                                            })}

                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    })}


                                </div>

                                <div className="flex mt-5">
                                    <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" onClick={(e) => makePrediction(e)}>
                                        Tahminle
                                    </button>

                                </div>


                            </form>
                            <div className="py-4 mt-10">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            {prediction || multiplePrediction ? (
                                <>
                                    {console.log("geldi")}
                                    {console.log(multiplePrediction)}
                                    {isMultiple  ? (
                                        

                                        <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-10">
                                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                                    <tr>
                                                        
                                                        {multiplePrediction.analysis.independent_variables.slice(0, 4).map((variable,key) => (
                                                            <th scope="col" className="px-6 py-3" key={key}>
                                                                {variable.name}
                                                            </th>
                                                        ))}

                                                        <th scope="col" className="px-6 py-3">

                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {multiplePrediction.predictions.slice((currentPage*10),((currentPage*10)+10)).map((prediction_made, index) => (

                                                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600" key={index}>                                                                                                                        
                                                            
                                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                                                {prediction_made[multiplePrediction.analysis.independent_variables[0].name]}
                                                            </th>
                                                            <td className="px-6 py-4">
                                                                {prediction_made[multiplePrediction.analysis.independent_variables[1].name]}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {prediction_made[multiplePrediction.analysis.independent_variables[2].name]}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {prediction_made[multiplePrediction.analysis.independent_variables[3].name]}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <button type="button" data-modal-toggle="defaultModal" onClick={(e) =>{ 
                                                                    setPredictionIndex(e.currentTarget.getAttribute("prediction-index"))
                                                                    handleModal(e)
                                                                    }} className="font-medium text-blue-600 dark:text-blue-500 hover:underline" prediction-index={index}>Analizi Göster</button>
                                                            </td>
                                                        </tr>
                                                    ))}


                                                </tbody>
                                            </table>
                                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                                <div className="flex-1 flex justify-between sm:hidden">
                                                    <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"> Previous </a>
                                                    <a href="#" className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"> Next </a>
                                                </div>
                                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                                    <div>
                                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                            {_.times(totalPage).map((value,index) => (
                                                                 <a href="#" aria-current="page" key={index} onClick={() => setCurrentPage(index)} className="z-10 bg-indigo-50 border-indigo-500 text-indigo-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"> {index+1} </a>
                                                            ))}
                                                         

                                                        </nav>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="fixed z-10 inset-0  hidden overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true" id="defaultModal">
                                                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

                                                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>


                                                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>


                                                    <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                                            <div className="flex justify-between">
                                                                <h1>Tahmin Sonucu</h1>
                                                                <button onClick={handleModal}>
                                                                    <svg width="35px" height="35px" viewBox="0 0 72 72" id="emoji" xmlns="http://www.w3.org/2000/svg">
                                                                        <g id="color" />
                                                                        <g id="hair" />
                                                                        <g id="skin" />
                                                                        <g id="skin-shadow" />
                                                                        <g id="line">
                                                                            <line x1="17.5" x2="54.5" y1="17.5" y2="54.5" fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2" />
                                                                            <line x1="54.5" x2="17.5" y1="17.5" y2="54.5" fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2" />
                                                                        </g>
                                                                    </svg>

                                                                </button>



                                                            </div>
                                                            {console.log("index")}
                                                            {console.log(multiplePrediction.predictions[parseInt(predictionIndex)])}
                                                            {predictionIndex && (
                                                                <div className="flex flex-wrap space-x-2 mt-10 justify-around">                                                                    
                                                              
                                                                {analysis.category_image_map_list.map((cim,key) => (

                                                                     <div className="grid w-1/6 h-1/6 mb-5 " key={key}>                                                                                                                                                 
                                                                         <p className="justify-self-center mt-2">{cim.category}</p>
                                                                        <img className="rounded-full border border-gray-100 shadow-sm justify-self-center w-20 h-20" src={`${ApiStaticUrl}` + cim.image} alt="user image" />                                                                                                                                               
                                                                        <p className="justify-self-center mt-2">%{parseFloat(multiplePrediction.predictions[predictionIndex][cim.category] * 100).toFixed(2)}</p>
                                                                     </div>
                                                                ))}
                                                               
                                                          



                                                        </div>


                                                            )}
                                                            


                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                            
                                        </div>
                                    ) : (


                                        <div className="flex flex-wrap space-x-2 mt-10 justify-center">
                                            
                                            

                                            {prediction && prediction.map((value, key) => {


                                                var image = analysis.category_image_map_list.filter(obj => {

                                                    return obj.category === value[0]
                                                })[0].image
                                                




                                                return (
                                                    <div className="grid w-1/6 h-1/6" key={key}>
                                                        
                                                        <p className="justify-self-center mt-2">{value[0]}</p>
                                                        <img className="rounded-full border border-gray-100 shadow-sm justify-self-center w-20 h-20" src={ApiStaticUrl+ image} alt="user image" />
                                                        <p className="justify-self-center mt-2">%{value[1] * 100}</p>
                                                    </div>

                                                )

                                            })}




                                        </div>

                                    )}
                                </>


                            ): null}





                        </div>

                    </div>



                ) : (
                    <div className="grid grid-rows-12 grid-cols-12" >
                        <aside className="col-span-2 row-span" aria-label="Sidebar" >
                            <div className="overflow-y-auto py-4 px-3 bg-gray-50 " style={{ height: "100vh" }}>
                                <div className="flex items-center pl-2.5 mb-5">
                                    <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Değişkenler</span>
                                </div>

                            </div>
                        </aside>

                        <div className=" col-start-4 col-span-8 row-start-1 mt-10 ">
                            <div className="relative flex flex-col sm:flex-row sm:items-center bg-white shadow rounded-md py-5 pl-6 pr-8 sm:pr-6">
                                <div className="flex flex-row items-center border-b sm:border-b-0 w-full sm:w-auto pb-4 sm:pb-0">

                                    <div className="text-sm font-medium ml-3">Analiz henüz hazır değil.</div>
                                </div>
                                <div className="text-sm tracking-wide text-gray-500 mt-4 sm:mt-0 sm:ml-4">Sayfayı yenileyerek tekrar deneyin. Analiziniz hazır olduğunda yüklenecek.</div>

                            </div>
                        </div>
                    </div>
                )
            }




        </>
    )
}
