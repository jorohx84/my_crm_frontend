import { Component, inject } from '@angular/core';
import { GlobalService } from '../services/global.service';
import { CommonModule } from '@angular/common';
import { Customer } from '../models/customer.models';
import { FormsModule, NgForm } from '@angular/forms';
import { UserService } from '../services/user.service';
import { APIService } from '../services/api.service';
import { response } from 'express';
import { DataService } from '../services/data.service';
import { CustomerwrapperComponent } from '../customerwrapper/customerwrapper.component';
import { ObservableService } from '../services/observable.service';

@Component({
  selector: 'app-customers',
  imports: [CommonModule, FormsModule, CustomerwrapperComponent],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent {
  globalservice = inject(GlobalService);
  userservice = inject(UserService);
  dataservice = inject(DataService);
  apiservice = inject(APIService);
  observerservice = inject(ObservableService);
  isOpen: boolean = false;
  customer = this.dataservice.emptyCustomer;
  user: any;
  customers: any[] = [];
  allCustomers: any[] = [];
  // isValid: boolean = false;
  // isSend: boolean = false;
  isFound: boolean = false;
  searchFilterOpen: boolean = false;
  isloading: boolean = true;

  customerFields = [  //hier werden die felder der Tabelle hinzugefügt!!!!!
    { fieldName: 'companyname', displayName: 'Firmenname' },
    { fieldName: 'street', displayName: 'Straße' },
    { fieldName: 'areacode', displayName: 'Postleitzahl' },
    { fieldName: 'city', displayName: 'Stadt' },
    { fieldName: 'country', displayName: 'Land' },
    // { fieldName: 'email', displayName: 'E-Mail' },
    // { fieldName: 'phone', displayName: 'Telefon' },
    // { fieldName: 'website', displayName: 'Webseite' },
    { fieldName: 'branch', displayName: 'Branche' },

  ];
  currentSearchFilter: any = this.customerFields[0];
  searchValue: string = '';
  isSearch: boolean = false;
  customerList = [
    { companyname: "TechNova GmbH", street: "Hauptstraße 45", areacode: "10115", city: "Berlin", country: "Deutschland", email: "kontakt@technova.de", phone: "+49 30 1234567", website: "https://www.technova.de", branch: "IT-Dienstleistungen", created_by: 1 },
    { companyname: "GreenLeaf Solutions", street: "Parkweg 12", areacode: "20095", city: "Hamburg", country: "Deutschland", email: "info@greenleaf-solutions.de", phone: "+49 40 9876543", website: "https://www.greenleaf-solutions.de", branch: "Umwelttechnik", created_by: 2 },
    { companyname: "Müller Bau AG", street: "Baustraße 8", areacode: "80331", city: "München", country: "Deutschland", email: "service@muellerbau.de", phone: "+49 89 556677", website: "https://www.muellerbau.de", branch: "Bauwesen", created_by: 3 },
    { companyname: "AutoParts24", street: "Industriestraße 19", areacode: "50667", city: "Köln", country: "Deutschland", email: "verkauf@autoparts24.de", phone: "+49 221 998877", website: "https://www.autoparts24.de", branch: "Automobilhandel", created_by: 4 },
    { companyname: "Helios Consulting", street: "Königsallee 30", areacode: "40212", city: "Düsseldorf", country: "Deutschland", email: "kontakt@helios-consulting.de", phone: "+49 211 445566", website: "https://www.helios-consulting.de", branch: "Unternehmensberatung", created_by: 1 },
    { companyname: "Nordlicht Media", street: "Seestraße 7", areacode: "24103", city: "Kiel", country: "Deutschland", email: "info@nordlicht-media.de", phone: "+49 431 778899", website: "https://www.nordlicht-media.de", branch: "Marketing & Werbung", created_by: 2 },
    { companyname: "Bergmann Electronics", street: "Schillerstraße 22", areacode: "70173", city: "Stuttgart", country: "Deutschland", email: "support@bergmann-electronics.de", phone: "+49 711 332211", website: "https://www.bergmann-electronics.de", branch: "Elektronik", created_by: 3 },
    { companyname: "PureWater Systems", street: "Wasserweg 10", areacode: "01067", city: "Dresden", country: "Deutschland", email: "kontakt@purewater.de", phone: "+49 351 998877", website: "https://www.purewater.de", branch: "Haustechnik", created_by: 4 },
    { companyname: "Skyline Architektur", street: "Planstraße 4", areacode: "90402", city: "Nürnberg", country: "Deutschland", email: "mail@skyline-architektur.de", phone: "+49 911 223344", website: "https://www.skyline-architektur.de", branch: "Architektur", created_by: 1 },
    { companyname: "SolarOne Energy", street: "Sonnenweg 5", areacode: "04109", city: "Leipzig", country: "Deutschland", email: "info@solarone-energy.de", phone: "+49 341 887766", website: "https://www.solarone-energy.de", branch: "Erneuerbare Energien", created_by: 2 },
    { companyname: "DataScope Analytics", street: "Analysenstraße 9", areacode: "60311", city: "Frankfurt am Main", country: "Deutschland", email: "info@datascope.de", phone: "+49 69 556688", website: "https://www.datascope.de", branch: "Datenanalyse", created_by: 3 },
    { companyname: "UrbanFoods GmbH", street: "Marktplatz 2", areacode: "70174", city: "Stuttgart", country: "Deutschland", email: "kontakt@urbanfoods.de", phone: "+49 711 667788", website: "https://www.urbanfoods.de", branch: "Lebensmittelhandel", created_by: 4 },
    { companyname: "SkyNet Solutions", street: "Netzwerkallee 99", areacode: "20097", city: "Hamburg", country: "Deutschland", email: "support@skynet.de", phone: "+49 40 665544", website: "https://www.skynet.de", branch: "IT-Infrastruktur", created_by: 1 },
    { companyname: "AquaTech Industries", street: "Flussufer 33", areacode: "01069", city: "Dresden", country: "Deutschland", email: "kontakt@aquatech.de", phone: "+49 351 778812", website: "https://www.aquatech.de", branch: "Maschinenbau", created_by: 2 },
    { companyname: "NovaPrint", street: "Grafikstraße 15", areacode: "80333", city: "München", country: "Deutschland", email: "info@novaprint.de", phone: "+49 89 112233", website: "https://www.novaprint.de", branch: "Druckerei", created_by: 3 },
    { companyname: "EuroTrans Logistics", street: "Frachtstraße 25", areacode: "60313", city: "Frankfurt", country: "Deutschland", email: "info@eurotrans.de", phone: "+49 69 334455", website: "https://www.eurotrans.de", branch: "Logistik", created_by: 4 },
    { companyname: "MediLine Health", street: "Klinikweg 8", areacode: "04107", city: "Leipzig", country: "Deutschland", email: "service@mediline.de", phone: "+49 341 445566", website: "https://www.mediline.de", branch: "Gesundheit", created_by: 1 },
    { companyname: "NextWave Finance", street: "Bankgasse 4", areacode: "50668", city: "Köln", country: "Deutschland", email: "kontakt@nextwave.de", phone: "+49 221 998822", website: "https://www.nextwave.de", branch: "Finanzen", created_by: 2 },
    { companyname: "SmartBuild AG", street: "Architekturweg 6", areacode: "90403", city: "Nürnberg", country: "Deutschland", email: "info@smartbuild.de", phone: "+49 911 667744", website: "https://www.smartbuild.de", branch: "Bauplanung", created_by: 3 },
    { companyname: "BlueOcean Marine", street: "Hafenstraße 11", areacode: "28195", city: "Bremen", country: "Deutschland", email: "info@blueocean.de", phone: "+49 421 778844", website: "https://www.blueocean.de", branch: "Schifffahrt", created_by: 4 },
    { companyname: "AgriFuture", street: "Landweg 17", areacode: "35037", city: "Marburg", country: "Deutschland", email: "kontakt@agrifuture.de", phone: "+49 6421 556677", website: "https://www.agrifuture.de", branch: "Landwirtschaft", created_by: 1 },
    { companyname: "ComNet Global", street: "IT-Allee 42", areacode: "10117", city: "Berlin", country: "Deutschland", email: "info@comnet.de", phone: "+49 30 778899", website: "https://www.comnet.de", branch: "Telekommunikation", created_by: 2 },
    { companyname: "EcoSmart Energy", street: "Solarstraße 18", areacode: "04229", city: "Leipzig", country: "Deutschland", email: "kontakt@ecosmart.de", phone: "+49 341 665577", website: "https://www.ecosmart.de", branch: "Energie", created_by: 3 },
    { companyname: "GlobalFoods AG", street: "Marktstraße 3", areacode: "20099", city: "Hamburg", country: "Deutschland", email: "info@globalfoods.de", phone: "+49 40 556677", website: "https://www.globalfoods.de", branch: "Lebensmittel", created_by: 4 },
    { companyname: "FinScope Consulting", street: "Finanzallee 1", areacode: "60310", city: "Frankfurt", country: "Deutschland", email: "kontakt@finscope.de", phone: "+49 69 778899", website: "https://www.finscope.de", branch: "Beratung", created_by: 1 },
    { companyname: "PeakSport", street: "Sportstraße 9", areacode: "70180", city: "Stuttgart", country: "Deutschland", email: "info@peaksport.de", phone: "+49 711 334455", website: "https://www.peaksport.de", branch: "Sportartikel", created_by: 2 },
    { companyname: "UrbanHomes", street: "Wohnweg 22", areacode: "50670", city: "Köln", country: "Deutschland", email: "kontakt@urbanhomes.de", phone: "+49 221 778866", website: "https://www.urbanhomes.de", branch: "Immobilien", created_by: 3 },
    { companyname: "DataCore Systems", street: "Rechenstraße 2", areacode: "90409", city: "Nürnberg", country: "Deutschland", email: "support@datacore.de", phone: "+49 911 998877", website: "https://www.datacore.de", branch: "IT", created_by: 4 },
    { companyname: "MobiTrend", street: "Mobilweg 1", areacode: "04105", city: "Leipzig", country: "Deutschland", email: "info@mobitrend.de", phone: "+49 341 223355", website: "https://www.mobitrend.de", branch: "Technologie", created_by: 1 },
    { companyname: "Alpine Travel", street: "Bergstraße 12", areacode: "80335", city: "München", country: "Deutschland", email: "kontakt@alpinetravel.de", phone: "+49 89 998877", website: "https://www.alpinetravel.de", branch: "Tourismus", created_by: 2 },
    { companyname: "Silverline Software", street: "Codeweg 8", areacode: "10179", city: "Berlin", country: "Deutschland", email: "dev@silverline.de", phone: "+49 30 665544", website: "https://www.silverline.de", branch: "Softwareentwicklung", created_by: 3 },
    { companyname: "MediCare Plus", street: "Gesundheitsweg 5", areacode: "20097", city: "Hamburg", country: "Deutschland", email: "info@medicareplus.de", phone: "+49 40 889977", website: "https://www.medicareplus.de", branch: "Gesundheitswesen", created_by: 4 },
    { companyname: "NextGen Robotics", street: "Roboterallee 23", areacode: "70191", city: "Stuttgart", country: "Deutschland", email: "kontakt@nextgenrobotics.de", phone: "+49 711 778899", website: "https://www.nextgenrobotics.de", branch: "Robotik", created_by: 1 },
    { companyname: "Artify Studio", street: "Kreativweg 14", areacode: "50672", city: "Köln", country: "Deutschland", email: "info@artify.de", phone: "+49 221 445577", website: "https://www.artify.de", branch: "Design", created_by: 2 },
    { companyname: "GreenPower Systems", street: "Windstraße 18", areacode: "04155", city: "Leipzig", country: "Deutschland", email: "service@greenpower.de", phone: "+49 341 667799", website: "https://www.greenpower.de", branch: "Energie", created_by: 3 },
    { companyname: "NordicTrade", street: "Handelsweg 7", areacode: "20098", city: "Hamburg", country: "Deutschland", email: "kontakt@nordictrade.de", phone: "+49 40 889900", website: "https://www.nordictrade.de", branch: "Handel", created_by: 4 },
    { companyname: "SmartTech Labs", street: "Innovationsallee 10", areacode: "10178", city: "Berlin", country: "Deutschland", email: "info@smarttech.de", phone: "+49 30 445566", website: "https://www.smarttech.de", branch: "Forschung", created_by: 1 },
    { companyname: "EcoBuild GmbH", street: "Nachhaltigkeitsweg 4", areacode: "80331", city: "München", country: "Deutschland", email: "info@ecobuild.de", phone: "+49 89 667788", website: "https://www.ecobuild.de", branch: "Bau", created_by: 2 },
    { companyname: "VisionWorks", street: "Medienallee 3", areacode: "50667", city: "Köln", country: "Deutschland", email: "kontakt@visionworks.de", phone: "+49 221 998811", website: "https://www.visionworks.de", branch: "Marketing", created_by: 3 },
    { companyname: "BioNova Foods", street: "Ernährungsweg 5", areacode: "20095", city: "Hamburg", country: "Deutschland", email: "info@bionova.de", phone: "+49 40 554433", website: "https://www.bionova.de", branch: "Lebensmittel", created_by: 4 },
    { companyname: "TechEdge Consulting", street: "Businessstraße 12", areacode: "60311", city: "Frankfurt", country: "Deutschland", email: "info@techedge.de", phone: "+49 69 778866", website: "https://www.techedge.de", branch: "Beratung", created_by: 1 },
    { companyname: "AeroLine Systems", street: "Flughafenstraße 20", areacode: "40474", city: "Düsseldorf", country: "Deutschland", email: "kontakt@aeroline.de", phone: "+49 211 445577", website: "https://www.aeroline.de", branch: "Luftfahrt", created_by: 2 },
    { companyname: "OceanNet GmbH", street: "Marineweg 3", areacode: "28195", city: "Bremen", country: "Deutschland", email: "info@oceannet.de", phone: "+49 421 889977", website: "https://www.oceannet.de", branch: "Kommunikation", created_by: 3 },
    { companyname: "AlphaCom IT", street: "Technologieallee 22", areacode: "10117", city: "Berlin", country: "Deutschland", email: "kontakt@alphacom.de", phone: "+49 30 889900", website: "https://www.alphacom.de", branch: "IT", created_by: 4 },
    { companyname: "EcoTrans Logistics", street: "Transportstraße 8", areacode: "60327", city: "Frankfurt", country: "Deutschland", email: "service@ecotrans.de", phone: "+49 69 667788", website: "https://www.ecotrans.de", branch: "Logistik", created_by: 1 },
    { companyname: "MetaVision", street: "Innovationstraße 9", areacode: "70174", city: "Stuttgart", country: "Deutschland", email: "info@metavision.de", phone: "+49 711 112233", website: "https://www.metavision.de", branch: "Technologie", created_by: 2 },
    { companyname: "UrbanFlow Design", street: "Architekturplatz 6", areacode: "50676", city: "Köln", country: "Deutschland", email: "kontakt@urbanflow.de", phone: "+49 221 334455", website: "https://www.urbanflow.de", branch: "Architektur", created_by: 3 },
    { companyname: "BluePeak Energy", street: "Windkraftweg 15", areacode: "04109", city: "Leipzig", country: "Deutschland", email: "info@bluepeak.de", phone: "+49 341 998877", website: "https://www.bluepeak.de", branch: "Energie", created_by: 4 },
  ];



  ngOnInit() {
   
    this.userservice.getUser().subscribe((user) => {
      if (user) {
        this.user = user;
      }
    })
    this.observerservice.customerTriggersubject$.subscribe(() => {
      this.loadCustomers();
    })

    this.loadCustomers()
  }

  loadCustomers() {
    this.apiservice.getData('customers/').subscribe({
      next: (response) => {
        this.customers = response;
        this.allCustomers = response;
        this.isloading = false;
        console.log('Kunden aus DB geladen!', response);
        this.sortList();
      },
      error: (err) => {
        console.error("Daten konnten nicht geladen werden", err)
      }
    });

  }

  sortList() {
    this.customers.sort((a, b) => a.companyname.localeCompare(b.companyname));
    this.allCustomers.sort((a, b) => a.companyname.localeCompare(b.companyname));
  }

  fillDB() {

    for (let index = 0; index < this.customerList.length; index++) {
      const customer = this.customerList[index];
      this.apiservice.postData('customers/', customer).subscribe({
        next: (response) => {
          console.log('Daten erfolgreich gespeichert', response);

        },
        error: (err) => console.error(err)
      });
    }
  }

  openFilter() {
    this.searchFilterOpen = !this.searchFilterOpen;
  }

  changeSearchFitler(index: number) {
    this.currentSearchFilter = this.customerFields[index];
  }

  searchCustomer() {
    if (this.searchValue.length > 0) {
      this.isSearch = true;
      const key: keyof Customer = this.currentSearchFilter.fieldName as keyof Customer;
      const searchedCustomers: any[] = [];
      for (let index = 0; index < this.allCustomers.length; index++) {
        const customer = this.allCustomers[index];
        if (customer[key].toLowerCase().includes(this.searchValue.toLowerCase())) {
          searchedCustomers.push(customer);
          console.log(searchedCustomers);

        }
      }
      this.isFound = searchedCustomers.length > 0 ? true : false;
      this.customers = searchedCustomers;
    } else {
      this.customers = this.allCustomers;
      this.isSearch = false;
    }
  }

  openCustomerFile(index: number) {
    const customer = this.customers[index];
    this.globalservice.navigateToPath(['main', 'singlecustomer', customer.id, 'dashboard'])

  }
}
