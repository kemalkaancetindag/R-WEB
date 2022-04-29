import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import myLogo from '../public/monitoring.png'
import _ from 'lodash'







export default function Panel() {

    const [allAnalysis, setAllAnalysis] = useState()
    const [currentPage, setCurrentPage] = useState(0)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [totalPage, setTotalPage] = useState()
    const [username, setUsername] = useState()
    const router = useRouter()

    useEffect(async () => {
        const token = localStorage.getItem("user_token")
        if (token) {
            try {

                const analysis = await axios.get("http://localhost:3002/api/analysis/all-analysis")
                setTotalPage(Math.ceil((analysis.data.data.length / itemsPerPage)))
                setAllAnalysis(analysis.data.data)

            }
            catch (e) {
                console.log(e.toString())
            }
        }
        else {
            router.push("/panelLogin")
        }


    }, [])

    const deleteAnalysis = async (id) => {
        try {
            await axios.get(`http://localhost:3002/api/analysis/delete-analysis?id=${id}`)
            const analysis = await axios.get("http://localhost:3002/api/analysis/all-analysis")
            setTotalPage(Math.ceil((analysis.data.data.length / itemsPerPage)))
            setAllAnalysis(analysis.data.data)
        }
        catch (e) {
            console.log(e.toString())
        }
    }

    const logout = () => {
        localStorage.removeItem("user_token")
        router.push("/panelLogin")
    }



    return (
        <>
            <nav class="bg-white border-gray-200 px-2 sm:px-4 py-2.5  dark:bg-gray-800">
                <div class="container flex flex-wrap justify-between items-center mx-auto">
                    <img src='/monitoring.png' class="mr-3 h-6 sm:h-9" alt="Flowbite Logo" />
                    <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Panel</span>

                    <div class="hidden w-full md:block md:w-auto" id="mobile-menu">
                        <ul class="flex flex-col mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium">
                            <li>
                                <a href="newAnalysis" class="block py-2 pr-4 pl-3 text-white bg-blue-700 rounded md:bg-transparent  md:p-0 dark:text-white" aria-current="page">Yeni Analiz</a>
                            </li>
                            <li>
                                <a href="#" class="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700" onClick={logout}>Çıkış</a>
                            </li>

                        </ul>
                    </div>
                </div>
            </nav>

            <div class="container mx-auto">
                <div className="flex justify-start mt-10">
                    <h1 className="font-bold text-2xl">Analizler</h1>

                </div>

                {allAnalysis && allAnalysis.length > 0 ? (
                    <div class="relative overflow-x-auto shadow-md sm:rounded-lg mt-10">
                        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" class="px-6 py-3">
                                        Analiz Kodu
                                    </th>
                                    <th scope="col" class="px-6 py-3">
                                        Oluşturulma Tarihi
                                    </th>
                                    <th scope="col" class="px-6 py-3">
                                        Kayıtlı Model Yolu
                                    </th>
                                    <th scope="col" class="px-6 py-3">
                                        Tahmin Başarısı
                                    </th>
                                    <th scope="col" class="px-6 py-3">
                                        Model Durumu
                                    </th>

                                    <th scope="col" class="px-6 py-3">
                                        <span class="sr-only">İşlemler</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {allAnalysis.slice((currentPage * itemsPerPage), ((currentPage * itemsPerPage) + itemsPerPage)).map((value, index) => (

                                    <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <th scope="row" class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                            {value.analysis_code}
                                        </th>
                                        <td class="px-6 py-4">
                                            {value.created_at_shown}
                                        </td>
                                        <td class="px-6 py-4">
                                            {value.model_file_path}
                                        </td>
                                        <td class="px-6 py-4">
                                            %{value.accuracy}
                                        </td>
                                        <td class="px-6 py-4 text-green">
                                            {value.is_model_ready ? <>
                                                <span className="text-green-500">Hazır</span>
                                            </> : <><span className="text-yellow-500">Eğitiliyor</span></>}
                                        </td>

                                        <td class="px-6 py-4 text-right">
                                            <a href="#" class="font-medium text-blue-600 dark:text-blue-500 hover:underline" onClick={() => deleteAnalysis(value._id)}>Sil</a>
                                        </td>
                                    </tr>

                                ))}

                            </tbody>
                        </table>
                        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">

                            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">

                                <div>
                                    <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">

                                        {totalPage && _.times(totalPage, (index) => {
                                            console.log("geldi")
                                            if (currentPage == index) {
                                                return (
                                                    <a href="#" aria-current="page" class="z-10 bg-indigo-50 border-indigo-500 text-indigo-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium" onClick={() => setCurrentPage(index)}>{index + 1}</a>
                                                )
                                            }
                                            else {
                                                return (
                                                    <a href="#" class="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium" onClick={() => setCurrentPage(index)}> {index + 1} </a>
                                                )
                                            }
                                        })}



                                    </nav>
                                </div>
                            </div>
                        </div>



                    </div>
                ) : <></>}



            </div>
        </>
    )
}