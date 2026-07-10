import { loadCSS } from "./loadCSS.js";

export function insertFooter(){

    loadCSS("assets/css/components/footer.css");

    return `

        <footer>

            <div>
                <img src="assets/icons/Group 1.svg" alt="icon">
                <p>Developed by <a href="http://spinzi.github.io">Spinzi</a></p>
            </div>

            <div>
                <p class="f_title">QUIZO</p>
                <p><a href="js/services/privacy-policy.txt">Privacy Policy</a></p>
                <p><a href="js/services/terms-of-service.txt">Terms of Service</a></p>
            </div>

            <div>
                <p class="f_title">Contact</p>
                <p><a href="mailto:alinnicusorgisca@gmail.com">Mail</a></p>
                <p><a href="https://github.com/Spinzi">Github</a></p>
            </div>



        </footer>

    `

}