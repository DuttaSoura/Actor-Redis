const redis = require('redis')
const fs = require('fs');

// create and connect redis client to local instance.
const client = redis.createClient(6379)
 
// echo redis errors to the console
client.on('error', (err) => {
    
    console.log(`Error in connecting: " ${err.stack}`)
    process.exit(1);
});
 
function writeToFile(key, dir, fileName) {

    return new Promise((resolve, reject)=>{
    
        client.get(key, function(err, reply) {
           
            // reply is null when the key is missing
            console.log(`data size for key: ${key} ::: ${reply.length}`);

            if(!reply || err){

                reject(`error while getting data for key, reply, error: ${key}, ${reply}, ${err.stack}`);
            }
            else{

                fs.writeFile(`${dir}/${fileName}`, reply, (err) => {
                    
                    if (err) {

                        reject(`error while writing file: ${err.stack}`);
                    }
                    else{
                    
			client.del(key, (err, response) => {

                            if (response == 1){

                                console.log(`${key} has been deleted!`);
                            }
                            else{

                                console.log(`${key} failed to delete. Error: ${err.stack}`);
                            }
                            
                            resolve(`The file for key: ${key} has been saved!`);
                        });                              
                    }
                });
            }
        });
    });
}

 
client.keys('*', async (err, keys)=> {

    if (err){
        
        console.log(`no keys available: ${err.stack}`);
        process.exit(1);
    }


    for(var key of keys) {

        await new Promise((resolve, reject) =>{

            let dir = key.split('/');
            const fileName = dir.pop();
            dir = dir.join('/');

            if(!fs.existsSync(dir)){

                console.log(`inside not exists: ${key}`);
                
                fs.mkdir(dir, {recursive: true}, (err) =>{

                    if (err){
            
                        console.log(`error while creating path: ${err.stack}`);
                        resolve();
                    }
                    else{

                        writeToFile(key, dir, fileName)
                        .then((reply) => {

                            console.log(reply);
                            resolve();
                        })
                        .catch((err) => {

                            console.log(err);
                            resolve();
                        });
                    }
                });
            }
            else{

                console.log(`inside exists: ${key}`);

                writeToFile(key, dir, fileName)
                .then((reply)=>{

                    console.log(reply);
                    resolve();
                })
                .catch(()=>{

                    console.log(err);
                    reject();
                });
            }
        });
    }
}); 


