class Card
{
    constructor(FatherElement, ID, textContent)
    {
        this.FatherElement = FatherElement;
        this.ID = ID;
        this.textContent = textContent;
        
        this.paddingLeft = "20px"
        this.paddingRight = "20px"
        this.paddingTop = "5px"
        this.paddingBottom = "5px"

        this.background = "rgb(230, 230, 230)";
    }

    init()
    {
        this.Create();
    }

    Create()
    {
        let FatherElement = document.getElementById(this.FatherElement);
        let element = document.createElement('DIV');
    
        element.setAttribute("data-bs-toggle", "collapse");
        element.setAttribute("class", "collapse ");
    
        element.id = this.ID;
        element.textContent = this.textContent;
        element.style.fontSize = "smaller";
        element.style.whiteSpace = "pre-wrap";
    
        element.style.paddingLeft = this.paddingLeft;
        element.style.paddingRight = this.paddingRight;
        element.style.paddingTop = this.paddingTop;
        element.style.paddingBottom = this.paddingBottom;
    
        element.style.background = this.background;
    
        FatherElement.appendChild(element);
    }
}