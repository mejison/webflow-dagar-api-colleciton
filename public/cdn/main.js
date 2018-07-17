var info = {},
	currentTab = "fyrirtaeki-matsedill",
	collections = {
		"fyrirtaeki-matsedill" : "5b027781dcae793de740d72d",
		"skolarmatsedill" : "5b0276490648400ceb2c0065",
		"isaviamatsedill" : "5b0276b7a41169bdcc11c480",
	},
	dateField = {
            'fyrirtaeki-matsedill' : 'date',
			'skolarmatsedill' : 'date',
			'isaviamatsedill' : 'date'
	},
	current = 1,
	marginLeft = 0,
	widthSlide = 0,
	init = false,
	currDate,
	loc = "ISL";

Object.values = function(object) {
  var values = [];
  for(var i in object) {
    values.push(object[i]);
  }
  return values;
}
	
Webflow.push(function() {
	
	locale();
	
	moment.locale( ! loc ? "is": "en")
	
	$(".calend-btn.w-inline-block").click(function() {
		$(".calend-btn.w-inline-block").addClass("cb2");
		$(this).removeClass("cb2");
		$('.cb-text-wrap').find('.cb-border').remove();
		$(this).find('.cb-text-wrap').append($("<div>").addClass('cb-border'));
		currentTab = $(this).data('tab');
		current = 1;
		marginLeft = 0;
		print();
	});
	
	getCollection(function(data) {
		info = data;
		print();
	});
	
	
	$('[data-download="pdf"]').click(function () {   
		var firstDayWeek = Object.values(info[collections[currentTab]].items).sort(function(a, b) {
			return moment(a[dateField[currentTab]]).unix() - moment(b[dateField[currentTab]]).unix();
		}).shift();
		
		if (firstDayWeek['download-pdf']) {
			var win = window.open(firstDayWeek['download-pdf'], '_blank');
			win.focus();
		}
	});
	
	datepicker();
	
	
	current = 1;
	marginLeft = 0;
	widthSlide = $('.calend-slider-mask .w-slide:first').width() + $('.calend-slider .w-slider-arrow-left').width() + $('.calend-slider .w-slider-arrow-left').width();
	

    $.fn.goTo = function() {
        $('html, body').animate({
            scrollTop: $(this).offset().top + 'px'
        }, 'fast');
        return this;
    }
	
	$(document).on("click", ".calend-slider .w-slider-arrow-left", function() {
		if (current != 1) {
			current -= 1;
			marginLeft -= widthSlide;
			
			changeSlide(current, marginLeft);
			return ;
		}
		
		current += Object.values(info[collections[currentTab]].items).length - 1;
		marginLeft += widthSlide * (Object.values(info[collections[currentTab]].items).length - 1);
		
		changeSlide(current, marginLeft);
	});
	
	$(document).on("click", ".calend-slider .w-slider-arrow-right", function() {
		if (current != Object.values(info[collections[currentTab]].items).length) {
			current += 1;
			marginLeft += widthSlide;
			
			changeSlide(current, marginLeft);
			return ;
		}
		
		current = 1;
		marginLeft = 0;
		
		changeSlide(current, marginLeft);
	});
	
});

function changeSlide(current, marginLeft) {
	$(".calend-slider-mask.w-slider-mask .w-slide").each(function(index, value) {
		$(value).css({opacity: '1', transition: 'transform 500ms', transform : 'translateX(-' + marginLeft + 'px)'});
	});
	
	$('.calend-slider .slide-nav .w-slider-dot.w-active').removeClass('w-active');
	
	$(".calend-slider .slide-nav .w-slider-dot").each(function(index, value){
		if (index + 1 == current) {
			$(value).addClass('w-active');
		}
	});
}

function locale() {
	var segments = window.location.pathname.split('/');
	segments.shift();
	loc = segments.shift().toLowerCase() != 'eng' ? '' : '-english';
	translate();
}

function translate() {
	$("[data-download='pdf'] div").text( ! loc ? 'SÆKJA PDF' : 'Download PDF');
	
	var trs = {
		'fyrirtaeki-matsedill': {
			'is': 'Fyrirtæki',
			'en': 'Companies'
		},
		'skolarmatsedill': {
			'is': 'Skólar',
			'en': 'Schools'
		},
		'isaviamatsedill': {
			'is': 'Isavia', 
			'en': 'Isavia'
		}		
	};
	
	$("[data-tab]").each(function() { 
		var name = $(this).data('tab');
		console.lo
		$(this).find(".cb-text-wrap div:first").text(trs[name][ ! loc ? 'is' : 'en']);
	});
}

function datepicker() {
	
	var visibles = {},
		dps = {};
	$('[data-datepicker]').each(function(index, value) {
		var pickerIndex = $(value).data('datepicker');
		$(value).prepend($("<input style='opacity:0; height:0; width:0' class='datepicker-input-" + pickerIndex + "' />"));
		visibles[pickerIndex] = true;
		dps[pickerIndex] = $('.datepicker-input-' + pickerIndex + '').datepicker({
			language : ( ! loc ? "is": "en" ),
			dateFormat: 'yyyy-mm-dd',
			onSelect : function(date) {
				if (date) {
					dps[pickerIndex].selectDate(date);
					var current = moment(date).startOf('isoWeek').format("D. MMMM YYYY") + " - " + moment(date).startOf('isoWeek').add(6, 'days').format("D. MMMM YYYY");
					$(".calend-drop-toogle, .calend-drop-toogle-2").find("div").text(current);
					getCollection(function(data) {
						info = data;
						print();
						
						if($(".w-slider-nav").is(":visible")) {
							$('.calend-btns').goTo();
						}
					}, { date : date });
					
					currDate = moment(date, "YYYY-MM-DD");
					dps[pickerIndex].hide();
				}
			}
		}).data('datepicker');
		
		$("[data-calendar=" + pickerIndex + "]").click(function(event) {
			  event.stopPropagation();
			  visibles[pickerIndex] = ! visibles[pickerIndex];
			  if ( ! visibles[pickerIndex]) {
				dps[pickerIndex].show();
				return ;
			  }
			dps[pickerIndex].hide();
		});
	});
	 
	$('body').click(function() {
		$('[data-datepicker]').each(function(index, value) {
			var pickerIndex = $(value).data('datepicker');
			visibles[pickerIndex] = true;
		});
	});
	
	$(".calend-drop-toogle, .calend-drop-toogle-2").find("div").text(moment().startOf('isoWeek').format("D. MMMM YYYY") + " - " + moment().startOf('isoWeek').add(6, 'days').format("D. MMMM YYYY"));

}

function print() {
	var data = info[collections[currentTab]];
	if (currentTab && window["print" + currentTab.charAt(0).toUpperCase() + currentTab.slice(1)]) {
		var arr = Object.values(data.items);
		window["print" + currentTab.charAt(0).toUpperCase() + currentTab.slice(1)](arr);
		
		if($(".w-slider-nav").is(":visible")) {
			setSlideByIndex(currDate);
			if ( ! init) {
				setTodaySlide(arr);
				init = true;
			}
		}
	}
}

function setSlideByIndex(currentTime) {
	var arr = Object.values(info[collections[currentTab]].items),
		item,
		iscurrentDate;
	
	arr = arr.sort(function(a, b) { return moment(a[dateField[currentTab]]).unix() - moment(b[dateField[currentTab]]).unix(); });
	 
	for(var i in arr) { 
		item = moment(arr[i][dateField[currentTab]], "YYYY-MM-DD");
		iscurrentDate = item.isSame(currentTime, "day");		
		if(iscurrentDate) {
			current = (i * 1) + 1;
			marginLeft = widthSlide * (i * 1);
			changeSlide(current, marginLeft);
		}
	}
}

function setTodaySlide(arr) {
	var item,
		iscurrentDate;
			
	for(var i in arr) {
		item = moment(arr[i][dateField[currentTab]]);			
		iscurrentDate = item.isSame(new Date(), "day");
		if(iscurrentDate)
		{
			current = (i * 1) + 1;
			marginLeft = widthSlide * (i * 1);
			changeSlide(current, marginLeft);
		}
	}
}

function printSkolarmatsedill(news) {
	$(".calend-slider.w-slider").empty();
	var context = "";
	news = news.sort(function(a, b) { return moment(a.date).unix() - moment(b.date).unix(); });
	
	context += "<div class='calend-slider-mask w-slider-mask' id='download-target'>";
	if (news.length) {
		for(var n in news) {
			context += "<div class='calend-slide w-slide'>";
			context += "	<a href='javascript:void(0);' class='calend-link w-inline-block " + (moment(news[n]['date']).format('MM-DD-YYYY') == moment().format('MM-DD-YYYY') ? 'cl-active' : ''  ) + " '>";
			context += "		<div class='calend-data'>" + moment(news[n]['date']).format('D. MMMM YYYY') + "</div>";
			
			if (news[n]['name' + loc]) { 
				context += "		<div class='cakend-title text-capitalize'>" + moment(news[n]['date']).format('dddd') + "</div>";
			}
			
			context += "		<p class='calend-p'>";
			if (news[n]['menu-description' + loc]) {
				context += 	news[n]['menu-description'] ? news[n]['menu-description' + loc] : '';
			}
			context += "		</p>";
			
			if ((moment(news[n]['date']).format('MM-DD-YYYY') == moment().format('MM-DD-YYYY') ? 'cl-active' : ''  )) {
				context += "<div class='idag'><div>" + ( ! loc ? "Í dag": "Today" ) + "</div></div>";
			}
			
			context += "	</a>";
			context += "</div>";
		}
	} else {
		context += "<div class='calend-empty-list'>Enginn matseðill til fyrir þetta tímabil.</div>";
	}
	
	context += "</div>";
	
	if (news.length) {
		context += '<div class="arr w-slider-arrow-left">';
		context += '<img src="https://uploads-ssl.webflow.com/5aab9007b2d9ac9d254bd764/5b112066f2733bf753e5b710_left.svg">';
		context += '</div>';
		
		context += '<div class="arr w-slider-arrow-right">';
		context += "<img src='http://uploads.webflow.com/5aeb589ee6f062f8dd767943/5aeb589ee6f0622ab57679ab_rarr.svg'>";
		context += '</div>';
		
		context += '<div class="slide-nav w-slider-nav w-round">';
		context += '<div class="w-slider-dot w-active" style="margin-left: 5px; margin-right: 5px;"></div>';
		news.pop();
		for(var n in news) {
				context += '<div class="w-slider-dot" style="margin-left: 5px; margin-right: 5px;"></div>';
		}
		context += '</div>';
	}
	
	
	$(".calend-slider.w-slider").html(context);
}

window['printFyrirtaeki-matsedill'] = function(menus) {
	$(".calend-slider.w-slider").empty();
	var context = "";
	
	context += "<div class='calend-slider-mask w-slider-mask'>";
	menus = menus.sort(function(a, b) { return moment(a.date).unix() - moment(b.date).unix(); });
	if (menus.length) {
		for(var m in menus) {
			context += "<div class='calend-slide w-slide'>";
			context += "	<a href='javascript:void(0);' style='transform: translateX(0px); opacity: 1; transition: transform 500ms;' class='calend-link w-inline-block " + (moment(menus[m]['date']).format('MM-DD-YYYY') == moment().format('MM-DD-YYYY') ? 'cl-active' : ''  ) + "'>";
			context += "		<div class='calend-data'>" + moment(menus[m]['date']).format('D. MMMM YYYY') + "</div>";
			
			if (menus[m]['name' + loc]) {
				context += "		<div class='cakend-title text-capitalize'>" + moment(menus[m]['date']).format('dddd') + "</div>";
			}
			
			context += "		<p class='calend-p'>";
			
			if(menus[m]['menu-description' + loc]) {
				context += menus[m]['menu-description'] ? menus[m]['menu-description' + loc] : "";
			}
			
			context += "		</p>";
			
			if ((moment(menus[m]['date']).format('MM-DD-YYYY') == moment().format('MM-DD-YYYY') ? 'cl-active' : ''  )) {
				context += "<div class='idag'><div>"  + ( ! loc ? "Í dag": "Today" ) + "</div></div>";
			}
			
			context += "	</a>";
			context += "</div>";
		}
	} else {
		context += "<div class='calend-empty-list'>Enginn matseðill til fyrir þetta tímabil.</div>";
	}
	
	context += "</div>";
	
	if (menus.length) {
		context += '<div class="arr w-slider-arrow-left">';
		context += '<img src="https://uploads-ssl.webflow.com/5aab9007b2d9ac9d254bd764/5b112066f2733bf753e5b710_left.svg">';
		context += '</div>';
		
		context += '<div class="arr w-slider-arrow-right">';
		context += "<img src='http://uploads.webflow.com/5aeb589ee6f062f8dd767943/5aeb589ee6f0622ab57679ab_rarr.svg'>";
		context += '</div>';
		
		context += '<div class="slide-nav w-slider-nav w-round">';
		context += '<div class="w-slider-dot w-active" style="margin-left: 5px; margin-right: 5px;"></div>';
		menus.pop();
		for(var n in menus) {
			context += '<div class="w-slider-dot" style="margin-left: 5px; margin-right: 5px;"></div>';
		}
		context += '</div>';
	}
	
	$(".calend-slider.w-slider").html(context);
}

function printIsaviamatsedill(data) {
	$(".calend-slider.w-slider").empty();
	var context = "";
	
	context += "<div class='calend-slider-mask w-slider-mask'>";
	data = data.sort(function(a, b) { return moment(a.date).unix() - moment(b.date).unix(); });
	
	if (data.length) {
		for(var d in data) {
			context += "<div class='calend-slide w-slide' style='transform: translateX(0px); opacity: 1;'>";
			context += "	<a href='javascript:void(0);' class='calend-link w-inline-block " + (moment(data[d]['date']).format('MM-DD-YYYY') == moment().format('MM-DD-YYYY') ? 'cl-active' : ''  ) + "'>";
			context += "		<div class='calend-data'>" + moment(data[d]['date']).format('D. MMMM YYYY') + "</div>";
			
			if (data[d]['name' + loc]) { 
				context += "<div class='cakend-title text-capitalize'>" + moment(data[d]['date']).format('dddd') + "</div>";
			}
			
			context += "<p class='calend-p'>";
			
			if (data[d]['menu-description' + loc]) {
				context += data[d]['menu-description' + loc];
			}
			
			context += "</p>";
			
			if ((moment(data[d]['date']).format('MM-DD-YYYY') == moment().format('MM-DD-YYYY') ? 'cl-active' : ''  )) {
				context += "<div class='idag'><div>" + ( ! loc ? "Í dag": "Today" ) + "</div></div>";
			}
			
			context += "	</a>";
			context += "</div>";
		}
	} else {
		context += "<div class='calend-empty-list'>Enginn matseðill til fyrir þetta tímabil.</div>";
	}
	
	context += "</div>";
	
	if (data.length) {
		context += '<div class="arr w-slider-arrow-left">';
		context += '<img src="https://uploads-ssl.webflow.com/5aab9007b2d9ac9d254bd764/5b112066f2733bf753e5b710_left.svg">';
		context += '</div>';
		
		context += '<div class="arr w-slider-arrow-right">';
		context += "<img src='https://uploads-ssl.webflow.com/5aab9007b2d9ac9d254bd764/5b112137881083a33d80e5b1_right.svg'>";
		context += '</div>';
		
		context += '<div class="slide-nav w-slider-nav w-round">';
		context += '<div class="w-slider-dot w-active" style="margin-left: 5px; margin-right: 5px;"></div>';
		data.pop();
		for(var n in data) {
				context += '<div class="w-slider-dot" style="margin-left: 5px; margin-right: 5px;"></div>';
		}
		context += '</div>';
	}
	
	$(".calend-slider.w-slider").html(context);
}

function getCollection(callback, date) {
	var date = date || false,
		counter = 0,
		responses = {};
	
	for(var c in collections) {
		$.ajax({
			url: "https://dagar.nmtm.is/api/v1/collection/" + collections[c] + ( date ? '?date=' + date.date : '' ),
			type: "GET",
			success: function(data) {
				counter ++;
				responses[data.collection_id] = data;
				if (Object.keys(responses).length == Object.keys(collections).length) {
					callback(responses);
				}
			}
		});
	}
}