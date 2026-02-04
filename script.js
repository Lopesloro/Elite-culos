function scrollParaProblema() {
    const secao = document.getElementById("problema");

    if (secao) {
        secao.scrollIntoView({
            behavior: "smooth"
        });
    }
}
