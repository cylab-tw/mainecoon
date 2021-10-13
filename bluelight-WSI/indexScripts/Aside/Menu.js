class Menu
{
    constructor(FatherElement, ID, textContent, CardContent)
    {
        this.FatherElement = FatherElement;
        this.ID = ID;
        this.textContent = textContent;
        this.CardID = this.ID + "Card";
        this.CardContent = CardContent;
        
        this.paddingLeft = "14px"
        this.paddingRight = "14px"
        this.paddingTop = "5px"
        this.paddingBottom = "5px"
    }

    init()
    {
        this.CreateMenu();
        this.CreateCard();
    }

    CreateMenu()
    {
        let FatherElement = document.getElementById(this.FatherElement);
        let element = document.createElement('DIV');

        element.setAttribute("role", "button");
        element.setAttribute("data-bs-toggle", "collapse");
        element.setAttribute("aria-controls", this.CardID);
        element.setAttribute("href", "#" + this.CardID);
        element.ariaExpanded = "false";
    
        element.id = this.ID;
        element.textContent = this.textContent;
        element.style.fontSize = "large";
    
        element.style.paddingLeft = this.paddingLeft;
        element.style.paddingRight = this.paddingRight;
        element.style.paddingTop = this.paddingTop;
        element.style.paddingBottom = this.paddingBottom;
    
        FatherElement.appendChild(element);
    }

    CreateCard()
    {
        let myCard = new Card(this.FatherElement, this.CardID, this.CardContent);
        myCard.init();
    }
}