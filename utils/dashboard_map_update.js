// get const for event listener
const select = document.querySelectorAll(".select");
const options_list = document.querySelectorAll(".options_list");
const options_1 = document.querySelectorAll(".opt_1");
const options_2 = document.querySelectorAll(".opt_2");

const options_list_data = document.querySelector(".options_list_data");
const options_list_region = document.querySelector(".options_list_region");

var map_titles = document.querySelector(".map_titles");
// var map_subtitles = document.querySelector(".map_sub_title");

// initialize current variable data
var currData;

// Show/hide the 2nd menu
function giveVarFullName(shortName) {
  console.log(shortName);
  if (shortName == "SPI1") {
    return "SPI (1 month)";
  }
  if (shortName == "SPI3") {
    return "SPI (3 month)";
  }
  if (shortName == "SPI6") {
    return "SPI (6 month)";
  }
  if (shortName == "SPI12") {
    return "SPI (12 month)";
  }
  if (shortName == "SMPct") {
    return "Soil Moisture Percentile";
  }
}

for (let i = 0; i < select.length; i++) {
  select[i].addEventListener("click", () => {
    options_list[i].classList.toggle("active");
    select[i].querySelector(".fa-angle-down").classList.toggle("fa-angle-up");
  });
}

options_1.forEach((option) => {
  option.addEventListener("click", () => {
    options_1.forEach((option) => {
      option.classList.remove("selected");
    });
    select[0].querySelector("span").innerHTML = option.innerHTML;
    // map_titles.querySelector("h3").innerHTML = option.innerHTML;
    map_titles.querySelector("h3").innerHTML = giveVarFullName(
      option.innerHTML
    );
    option.classList.add("selected");
    options_list[0].classList.toggle("active");
    select[0].querySelector(".fa-angle-up").classList.toggle("fa-angle-up");

    // change selected data var
    changeVariable();
    mapYearlyChanage();

    // clear all options_2 selected
    // options_2.forEach((option) => {
    //   option.classList.remove("selected");
    // });
    // select[1].querySelector("span").innerHTML = "Select Region";
  });
});

options_2.forEach((option) => {
  option.addEventListener("click", () => {
    options_2.forEach((option) => {
      option.classList.remove("selected");
    });
    select[1].querySelector("span").innerHTML = option.innerHTML;
    map_titles.querySelector("p").innerHTML = option.innerHTML;
    option.classList.add("selected");
    options_list[1].classList.toggle("active");
    select[1].querySelector(".fa-angle-up").classList.toggle("fa-angle-up");

    // change selected data var
    changeVariable();
    mapYearlyChanage();
  });
});

// radios selection => change variables & update
function getCheckedRadioSpanContent(radioGroupName) {
  // select all radios having [name=${radioGroupName}]
  const radios = document.querySelectorAll(
    `input[type="radio"][name="${radioGroupName}"]`
  );

  // check which radio checked
  for (let radio of radios) {
    if (radio.checked) {
      // find adjcent span element and get innerHTML value
      const span = radio.nextElementSibling;

      return span.innerHTML;
    }
  }
  // if no checked radio, retun null
  return null;
}

// add event listners to listen every change in radios
function addRadioChangeListener(radioGroupName) {
  const radios = document.querySelectorAll(
    `input[type="radio"][name="${radioGroupName}"]`
  );

  radios.forEach((radio) => {
    radio.addEventListener("click", () => {
      changeVariable();
      mapYearlyChanage();
      // selectedSpanContent = getCheckedRadioSpanContent(radioGroupName);
      // // 输出结果到某个元素，或在控制台中输出
      // console.log(selectedSpanContent);
    });
  });
}

// set listeners for radios

addRadioChangeListener("radio_time_res");
addRadioChangeListener("radio_space_res");

const radio_space_res = document.querySelectorAll(".radio_space_res");

// change variable function
function changeVariable() {
  // initialize parameters determining which data will be selected
  // src = "./data/prov_yearly/data_yearly_prov_1950_2016.js";
  var dataNameSelected = options_list_data.querySelector(".selected").innerHTML;
  var regionNameSelected =
    options_list_region.querySelector(".selected").innerHTML;
  console.log(regionNameSelected);
  var spaceresSelected = getCheckedRadioSpanContent("radio_space_res");

  // check parameters
  if (spaceresSelected == "National") {
    if (dataNameSelected == "SPI1") {
      currData = SPI1_Yearly_Country;
    }
    if (dataNameSelected == "SPI3") {
      currData = SPI3_Yearly_Country;
    }
    if (dataNameSelected == "SPI6") {
      currData = SPI6_Yearly_Country;
    }
    if (dataNameSelected == "SPI12") {
      currData = SPI12_Yearly_Country;
    }
    if (dataNameSelected == "SMPct") {
      currData = SMPct_Yearly_Country;
    }
  }
  if (spaceresSelected == "Provincial") {
    if (dataNameSelected == "SPI1") {
      if (regionNameSelected == "Cambodia") {
        currData = SPI1_yearly_prov_cam;
      }
      if (regionNameSelected == "Laos") {
        currData = SPI1_yearly_prov_lao;
      }
      if (regionNameSelected == "Thailand") {
        currData = SPI1_yearly_prov_tha;
      }
      if (regionNameSelected == "Myanmar") {
        currData = SPI1_yearly_prov_mya;
      }
      if (regionNameSelected == "Vietnam") {
        currData = SPI1_yearly_prov_vie;
      }
    }
    if (dataNameSelected == "SPI3") {
      if (regionNameSelected == "Cambodia") {
        currData = SPI3_yearly_prov_cam;
      }
      if (regionNameSelected == "Laos") {
        currData = SPI3_yearly_prov_lao;
      }
      if (regionNameSelected == "Thailand") {
        currData = SPI3_yearly_prov_tha;
      }
      if (regionNameSelected == "Myanmar") {
        currData = SPI3_yearly_prov_mya;
      }
      if (regionNameSelected == "Vietnam") {
        currData = SPI3_yearly_prov_vie;
      }
    }
    if (dataNameSelected == "SMPct") {
      if (regionNameSelected == "Cambodia") {
        currData = SMPct_yearly_prov_cam;
      }
      if (regionNameSelected == "Laos") {
        currData = SMPct_yearly_prov_lao;
      }
      if (regionNameSelected == "Thailand") {
        currData = SMPct_yearly_prov_tha;
      }
      if (regionNameSelected == "Myanmar") {
        currData = SMPct_yearly_prov_mya;
      }
      if (regionNameSelected == "Vietnam") {
        currData = SMPct_yearly_prov_vie;
      }
    }
  }

  console.log(dataNameSelected);
  console.log(spaceresSelected);
  console.log(currData);
  //   return currData;
}

// var dataSelected = options_list_data.querySelector(".selected").innerHTML;
// console.log(dataSelected);
