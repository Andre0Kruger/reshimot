let lista = {}

for (i = 0; i < 100; i++){
    let rand = Math.random() * 20;
    rand = Math.floor(rand);

    if (!lista[rand]){
        lista[rand] = 1;
    } else {
        lista[rand]++;
    }
}

console.log(lista);