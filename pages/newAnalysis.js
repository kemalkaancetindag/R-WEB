import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import crypto from "crypto"
import * as XLSX from 'xlsx/xlsx.mjs';






export default function NewAnalysis() {

    const [variables, setVariables] = useState()
    const [dependentVariables, setDependentVariables] = useState()
    const [independentVariables, setIndependentVariables] = useState()
    const [showVariableModal, setShowVariableModal] = useState(false)
    const [showCategoryModal, setShowCategoryModal] = useState(false)
    const [previewImageURL, setPreviewImageURL] = useState()
    const [categoryImageMaps, setCategoryImageMaps] = useState()
    const [imageFile, setImageFile] = useState()
    const [isCategoric, setIsCategoric] = useState(false)
    const router = useRouter()

    useEffect(async () => {
        const token = localStorage.getItem("user_token")

        if (token) {
        }
        else {
            router.push("/panelLogin")
        }






    }, [])


    const sendAnalysis = async (my_data) => {
        var analysisCode = crypto.randomBytes(20).toString('hex');
        var cimRequestList = []


        var form = new FormData()
        console.log("mydata")
        console.log(JSON.stringify(my_data.data))

        form.append("data", JSON.stringify(my_data.data))
        form.append("dependent_variable", JSON.stringify(my_data.dependent_variable))
        form.append("categoric_variables", JSON.stringify(my_data.categoric_variables))
        form.append("numeric_variables", JSON.stringify(my_data.numeric_variables))


        form.append("analysis_code", analysisCode)

        form.append("variables", JSON.stringify(variables))
        form.append("dependent_variables", JSON.stringify(dependentVariables))
        form.append("independent_variables", JSON.stringify(independentVariables))
        categoryImageMaps.forEach(cim => {
            console.log(cim)
            cimRequestList.push({ category: cim.category_name, image: `${cim.category_name}_${analysisCode}.${cim.image.type.split("/")[1]}` })
            var newFile = new File([cim.image], `${cim.category_name}_${analysisCode}.${cim.image.type.split("/")[1]}`, {
                type: cim.image.type
            });
            form.append("images", newFile)
        })
        form.append("category_image_map_list", JSON.stringify(cimRequestList))

        try {
            const response = await axios({
                method: "post",
                url: "http://localhost:3002/api/analysis/new-analysis",
                data: form,
                headers: { "Content-Type": "multipart/form-data" },
            })


        }
        catch (e) {
            console.log(e.toString())
        }


    }

    const createNewAnalysis = async () => {

        var file = document.getElementById("data-frame").files[0]
        var reader = new FileReader();
        reader.onload = async function (e) {
            var workbook = XLSX.read(e.target.result, {
                type: 'binary'
            });
            var sheet = workbook.Sheets[workbook.SheetNames[0]]
            const inputs = XLSX.utils.sheet_to_json(sheet, { header: 1 })
            var categoricVariableNames = []
            var numericVariableNames = []


            console.log(inputs)
            variables.forEach(variable => {
                if (variable.is_categoric) {
                    categoricVariableNames.push(variable.name)
                }
                else {
                    numericVariableNames.push(variable.name)
                }

            })

            try {
                var my_Data = { data: inputs, dependent_variable: dependentVariables[0].name, numeric_variables: numericVariableNames, categoric_variables: categoricVariableNames }
                await sendAnalysis(my_Data)
            }
            catch (e) {
                console.log(e.toString())
            }

            location.reload()


        };
        reader.onerror = function (e) {
            // error occurrec
            console.log(e)
            console.log('Error : ' + e.toString());
        };
        reader.readAsBinaryString(file);
    }



    const addVariable = () => {
        var name = document.getElementById("var_name").value


        var variable;
        if (isCategoric) {
            var categories_text = document.getElementById("categories-text").value

            variable = {
                name,
                type: "Kategorik",
                is_categoric: true,
                categories: categories_text.split("-"),
                var_id: Math.random()
            }

        }
        else {
            variable = {
                name,
                type: "Sayısal",
                is_categoric: false,
                var_id: Math.random()
            }
        }



        if (variables) {

            setVariables([...variables, variable])
        }
        else {

            var newVariables = []
            newVariables.push(variable)
            setVariables(newVariables)

        }
        setIsCategoric(false)
        console.log(variables)




    }

    const addIndependentVariable = (e) => {

        if (independentVariables) {
            setIndependentVariables([...independentVariables, variables[e.currentTarget.getAttribute("var-index")]])
        }
        else {
            var newIndependentVariables = []
            newIndependentVariables.push(variables[e.currentTarget.getAttribute("var-index")])
            setIndependentVariables(newIndependentVariables)
        }

    }

    const addDependentVariable = (e) => {

        if (dependentVariables) {
            setDependentVariables([...dependentVariables, variables[e.currentTarget.getAttribute("var-index")]])
        }
        else {
            var newDependentVariables = []
            newDependentVariables.push(variables[e.currentTarget.getAttribute("var-index")])
            setDependentVariables(newDependentVariables)
        }

    }

    const removeVariable = (e) => {
        var var_id = e.currentTarget.getAttribute("var-id")
        var newVariables = variables.filter((variable) => {
            return variable.var_id != var_id
        })

        setVariables(newVariables)
    }

    const removeIndependentVariable = (e) => {
        var var_id = e.currentTarget.getAttribute("var-id")
        var newIndependentVariables = independentVariables.filter((variable) => {
            return variable.var_id != var_id
        })

        setIndependentVariables(newIndependentVariables)

    }

    const removeDependentVariable = (e) => {
        var var_id = e.currentTarget.getAttribute("var-id")
        var newDependentVariables = dependentVariables.filter((variable) => {
            return variable.var_id != var_id
        })

        setDependentVariables(newDependentVariables)

    }


    const addCategoryImageMap = () => {
        var categoryName = document.getElementById("category-name").value



        var categoryMap = {
            image: imageFile,
            category_name: categoryName,
            preview_image: previewImageURL,
            map_id: Math.random()
        }

        if (categoryImageMaps) {
            setCategoryImageMaps([...categoryImageMaps, categoryMap])
        }
        else {
            var newcategoryImageMaps = []
            newcategoryImageMaps.push(categoryMap)
            setCategoryImageMaps(newcategoryImageMaps)
        }

        setPreviewImageURL(null)
        document.getElementById("category-name").value = ""

        console.log(categoryImageMaps)
    }

    const removeCategoryImageMap = (e) => {
        var map_id = e.currentTarget.getAttribute("map-id")
        var newMaps = categoryImageMaps.filter((cmap) => cmap.map_id != map_id)
        setCategoryImageMaps(newMaps)
    }

    const categoricCheck = (e) => {
        e.preventDefault()
        console.log(e.target.value)
        console.log(isCategoric)
        setIsCategoric(!isCategoric)
    }

    const logout = () => {
        localStorage.removeItem("user_token")
        router.push("/panelLogin")
    }





    const RenderVariableModal = () => {
        return (
            <div className="fixed z-10 inset-0   overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true" id="defaultModal">
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>


                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>


                    <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="flex justify-between">
                                <h1>Değişken Ekle</h1>
                                <button onClick={() => setShowVariableModal(false)}>
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
                            <div className="flex flex-wrap space-x-2  justify-around">

                                <form>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2" >
                                            Değişken Adı
                                        </label>
                                        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="var_name" type="text" placeholder="Değişken Adı" />
                                    </div>

                                    <div className="mb-4 flex  justify-center">
                                        <div className="mb-3 xl:w-96">
                                            <select
                                                onChange={(e) => {
                                                    if (e.target.value === "2") {
                                                        setIsCategoric(true)
                                                    }
                                                    else {
                                                        setIsCategoric(false)
                                                    }
                                                }}
                                                className="form-select appearance-none
                                                block
                                                w-full
                                                px-3
                                                py-1.5
                                                text-base
                                                font-normal
                                                text-gray-700
                                                bg-white bg-clip-padding bg-no-repeat
                                                border border-solid border-gray-300
                                                rounded
                                                transition
                                                ease-in-out
                                                m-0
                                                focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" aria-label="Default select example">
                                                <option value="1" >Sayısal</option>
                                                <option value="2" selected={isCategoric}>Kategorik</option>
                                            </select>
                                        </div>

                                    </div>
                                    {isCategoric ? (<div className="mb-6">

                                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlhtmlFor="password">
                                            Kategoriler
                                        </label>
                                        <input className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="categories-text" type="text" placeholder="Kategori1-Kategori2" />
                                        <p className="text-xs ">Kategorileri &#39;-&#39; ile Ayırarak Yazınız örn:(Kategori1-Kategori2)</p>
                                    </div>) : <></>}


                                    <div className="flex items-center justify-between">
                                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button" onClick={(e) => addVariable(e)}>
                                            Ekle
                                        </button>

                                    </div>
                                </form>

                            </div>



                        </div>

                    </div>
                </div>
            </div>
        )
    }

    const RenderCategoryModal = () => {
        return (
            <div className="fixed z-10 inset-0   overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true" id="defaultModal">
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>


                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>


                    <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="flex justify-between">
                                <h1>Değişken Ekle</h1>
                                <button onClick={() => setShowCategoryModal(false)}>
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
                            <div className="flex flex-wrap space-x-2  justify-around">

                                <form>
                                    <div className="relative w-full flex justify-center h-48 mb-4">

                                        <div className="w-full flex justify-center">
                                            <div className="border-2 z-10 absolute top-0 left-0 right-0 rounded-full w-40 h-40 mx-auto">
                                                {previewImageURL ? <img className="object-fill w-40 h-40 rounded-full" src={previewImageURL} /> : <div className="mt-10 px-4 text-gray-500">Fotoğraf Seçmek İçin Tıklayın</div>}
                                            </div>
                                            <input type="file" className="border-2 absolute top-0 z-10 opacity-0 mx-auto w-40 h-40 rounded-full" id="category-image" onChange={(e) => {
                                                setImageFile(e.target.files[0])
                                                setPreviewImageURL(URL.createObjectURL(e.target.files[0]))
                                            }
                                            } />

                                        </div>


                                    </div>
                                    <div className="mb-6">
                                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                            Kategori Adı
                                        </label>
                                        <input className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="category-name" type="text" placeholder="Kategori Adı" />

                                    </div>
                                    <div className="flex items-center justify-between">
                                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button" onClick={addCategoryImageMap}>
                                            Ekle
                                        </button>

                                    </div>
                                </form>

                            </div>



                        </div>

                    </div>
                </div>
            </div>
        )
    }



    return (
        <>
            <nav className="bg-white border-gray-200 px-2 sm:px-4 py-2.5  dark:bg-gray-800">
                <div className="container flex flex-wrap justify-between items-center mx-auto">
                     <img src='/monitoring.png' className="mr-3 h-6 sm:h-9" alt="Flowbite Logo" />
                        <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Panel</span>
                    <div className="hidden w-full md:block md:w-auto" id="mobile-menu">
                        <ul className="flex flex-col mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium">
                           {/*} <li>
                                <a href="#" className="block py-2 pr-4 pl-3 text-white bg-blue-700 rounded md:bg-transparent  md:p-0 dark:text-white" aria-current="page">Kullanıcı Ekle</a>
                            </li>*/}
                              <li>
                                <a href="panel" className="block py-2 pr-4 pl-3 text-white bg-blue-700 rounded md:bg-transparent  md:p-0 dark:text-white" aria-current="page">Analizler</a>
                            </li>
                            <li>
                                <a href="#" className="block py-2 pr-4 pl-3 text-white bg-blue-700 rounded md:bg-transparent  md:p-0 dark:text-white" aria-current="page">Yeni Analiz</a>
                            </li>
                            <li>
                                <a href="#" className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700" onClick={logout}>Çıkış</a>
                            </li>

                        </ul>
                    </div>
                </div>
            </nav>
            <div className="container mx-auto ">
                <div className="flex justify-start mb-10 mt-10">
                    <div className="flex justify-center">
                        <div className="mb-3 w-96">
                            <label htmlFor="formFile" className="form-label inline-block mb-2 font-bold text-2xl">Veri Seti</label>
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
                            focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" type="file" id="data-frame" />
                        </div>
                    </div>


                </div>
                <div className="flex justify-between mt-10">
                    <div>
                        <h1 className="font-bold text-2xl">Değişkenler</h1>
                    </div>
                    <div>
                        <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" onClick={() => setShowVariableModal(true)}>
                            Ekle
                        </button>
                    </div>

                </div>
                <div className="overflow-x-auto flex  flex-grow flex-row h-80 mt-5">


                    {variables && variables.map((value, index) => (
                        <div className="h-60 w-48 rounded  shadow-lg border-2 mr-5" key={index}>
                            <div className="flex justify-end">
                                <button var-id={value.var_id} onClick={(e) => removeVariable(e)}>
                                    <img src="/cancel.png" className="w-3 h-3 mr-2 mt-2" />
                                </button>


                            </div>

                            <div className="px-6 py-4">
                                <div className="font-bold text-xl mb-2">{value.name}</div>
                                <div className="relative flex py-5 items-center">
                                    <div className="flex-grow border-t border-gray-400"></div>

                                </div>
                                <p className="text-gray-700 text-base">
                                    {value.type}
                                </p>
                            </div>
                            <div className="flex flex-row justify-around mt-4">
                                <button className="h-8 px-4 m-2 text-sm text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800" var-index={index} onClick={(e) => addDependentVariable(e)}>
                                    Bağımlı
                                </button>
                                <button className="h-8 px-4 m-2 text-sm text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800" var-index={index} onClick={(e) => addIndependentVariable(e)}>
                                    Bağımsız
                                </button>

                            </div>



                        </div>

                    ))}





                </div>
                <div className="relative flex py-5 items-center">
                    <div className="flex-grow border-t border-gray-400"></div>

                </div>
                {showVariableModal ? <RenderVariableModal /> : null}
                {showCategoryModal ? <RenderCategoryModal /> : null}




                <div className="flex columns-2">
                    <div className="flex flex-col w-1/2 ">
                        <div className="flex justify-center mt-5">
                            <div>
                                <h1 className="font-bold text-2xl">Bağımlı Değişkenler</h1>
                            </div>


                        </div>
                        <div className="overflow-x-auto flex  flex-grow flex-row h-64 mt-5 justify-center">
                            {dependentVariables && dependentVariables.map((value, index) => (
                                <div className="h-40 w-48 rounded  shadow-lg border-2 mr-5" key={index}>
                                    <div className="flex justify-end">
                                        <button onClick={(e) => removeDependentVariable(e)} var-id={value.var_id}>
                                            <img src="/cancel.png" className="w-3 h-3 mr-2 mt-2" />
                                        </button>


                                    </div>

                                    <div className="px-6 py-4">
                                        <div className="font-bold text-xl mb-2">{value.name}</div>
                                        <div className="relative flex py-5 items-center">
                                            <div className="flex-grow border-t border-gray-400"></div>

                                        </div>
                                        <p className="text-gray-700 text-base">
                                            {value.type}
                                        </p>
                                    </div>


                                </div>

                            ))}








                        </div>

                    </div>

                    <div className="flex flex-col w-1/2">
                        <div className="flex justify-center mt-5">
                            <div>
                                <h1 className="font-bold text-2xl">Bağımsız Değişkenler</h1>
                            </div>


                        </div>
                        <div className="overflow-x-auto flex  justify-center flex-grow flex-row h-64 mt-5 border-l-2">
                            {independentVariables && independentVariables.map((value, index) => (
                                <div className="h-40 w-48 rounded  shadow-lg border-2 mr-5" key={index}>
                                    <div className="flex justify-end">
                                        <button onClick={(e) => removeIndependentVariable(e)} var-id={value.var_id}>
                                            <img src="/cancel.png" className="w-3 h-3 mr-2 mt-2" />
                                        </button>


                                    </div>

                                    <div className="px-6 py-4">
                                        <div className="font-bold text-xl mb-2">{value.name}</div>
                                        <div className="relative flex py-5 items-center">
                                            <div className="flex-grow border-t border-gray-400"></div>

                                        </div>
                                        <p className="text-gray-700 text-base">
                                            {value.type}
                                        </p>
                                    </div>


                                </div>

                            ))}









                        </div>

                    </div>


                </div>

                <div className="relative flex py-5 items-center">
                    <div className="flex-grow border-t border-gray-400"></div>

                </div>

                <div className="flex justify-between mt-5">
                    <div>
                        <h1 className="font-bold text-2xl">Tahmin Kategorileri ve Fotoğrafları</h1>
                    </div>
                    <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" onClick={() => setShowCategoryModal(true)}>
                        Ekle
                    </button>


                </div>
                <div className="overflow-x-auto flex  justify-start flex-grow flex-row h-80 mt-5 ">

                    {categoryImageMaps && categoryImageMaps.map((value, index) => (
                        <div className="h-62 w-48 rounded  shadow-lg border-2 mr-5" key={index}>
                            <div className="flex justify-end">
                                <button onClick={(e) => removeCategoryImageMap(e)} map-id={value.map_id}>
                                    <img src="/cancel.png" className="w-3 h-3 mr-2 mt-2" />
                                </button>


                            </div>

                            <div className="px-6 py-4">
                                <img className="rounded-full border border-gray-100 shadow-sm justify-self-center w-32 h-32" src={value.preview_image} alt="user image" />

                                <div className="relative flex py-5 items-center">
                                    <div className="flex-grow border-t border-gray-400"></div>

                                </div>
                                <div className="font-bold text-xl mb-2">{value.category_name}</div>

                            </div>


                        </div>

                    ))}









                </div>
                <div className="relative flex py-5 items-center">
                    <div className="flex-grow border-t border-gray-400"></div>

                </div>
                <div className="flex justify-end mb-10">

                    <button className="bg-transparent w-32 h-16 hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" onClick={createNewAnalysis}>
                        Oluştur
                    </button>

                </div>







            </div>
        </>

    )
}
