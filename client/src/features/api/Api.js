import Axios from "../../utils/Proxy";


export const Api1 = (url, method,data) => {
    return new Promise(async (resolve, reject) => {
        try {


console.log("I am inside in Api 1");
console.log(url);
console.log(method);
console.log(data);
            const api1 = await Axios({

                url: url,
                method: method,
                data: {...data}

            })
            console.log(api1);
            console.log(api1.status);


            if (api1.status >= 200 && api1.status < 300) {
                return resolve(api1);
            }
            throw new Error(api1);



        }

        catch (e) {
            if (e?.response?.data?.message == "Request failed with status code 401") {
                localStorage.clear();
            }
            return reject(e);
        }
    })

}


export const Api2 = (url, method) => {
    console.log("I am in API2");
    console.log(url);
    console.log(method);
    return new Promise(async (resolve, reject) => {
        try {



            const api1 = await Axios({

                url: url,
                method: method,

            })


            if (api1.status >= 200 && api1.status < 300) {
                return resolve(api1);
            }
            throw new Error(api1);



        }

        catch (e) {
            console.log(e);
            if (e?.response?.data?.message == "Request failed with status code 401") {
                localStorage.clear();
            }
            return reject(e);
        }
    })

}

export const Api3 = ({url, method,data}) => {
    return new Promise(async (resolve, reject) => {
        try {


console.log("I am inside in Api 1");
console.log(url);
console.log(method);
console.log(data);
            const api1 = await Axios({

                url: url,
                method: method,
                data: {...data},
                responseType: 'blob', // Ensuring the response is of type 'blob'
                headers: { 
                    'Content-Type': 'application/json', // Set your content type if needed
                    // Add any other headers you need
                }

            })
            console.log(api1);
            console.log(api1.status);


            if (api1.status >= 200 && api1.status < 300) {
                return resolve(api1);
            }
            throw new Error(api1);



        }

        catch (e) {
            if (e?.response?.data?.message == "Request failed with status code 401") {
                localStorage.clear();
            }
            return reject(e);
        }
    })

}
