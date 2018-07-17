start();

function start() {

	$(document).ready(function() {

		$.get("https://iss-island-abendingar.azurewebsites.net/Api/TasksWS", function(data, status) {
			console.log(status)
            // Það tókst að sækja formið
			var markup = data.replace("\\", "");
			$('#mainContainer').html("<p class='art-p'>Ertu með ábendingu eða athugasemd?</p>");
			$("#mainContainer").append(markup);
			$('.theInputsContainer').addClass('field-wrap');
			$('input[type="text"], textarea').each(function() {
				var text = $(this).siblings('h3').text();
				var placeholder = '<div class="placeholder">'+ text +'</div><div class="red-text">Þennan reit verður að fylla út</div>';
				$(this).parents('.theInputsContainer').append(placeholder);
				$(this).addClass('tf w-input');
			});
			$('textarea').addClass('tf-area');
			$('#submitButton').addClass('olive-btn ob-form obf2 w-button');
			$('#submitButton').css({
				'position': 'absolute',
				'bottom': '-100px',
				'left': '15px'
			});
			$('select').addClass('tf w-input').css('font-weight', '400');
			$('.theInputsHeader').css('display', 'none');
			$(".tf").bind('focus', function() {
	        	$(this).siblings(".placeholder").addClass("focused");
		    }).blur(function() {
		        if ($(this).val() == '') {
		            $(this).siblings(".placeholder").removeClass("focused");
		        }
		    });
		    $('#ExternalWSCreationForm').css({
		    	'display': 'flex',
		    	'flex-wrap': 'wrap',
		    	'position': 'relative'
		    });

			$("#submitButton").click(function() {
				var form = {};
				$("form#ExternalWSCreationForm :input").each(function() {
					if ($(this).attr("id") !== "submitButton") {
						form[$(this).attr("name")] = $(this).val();
					}
				});
				$.ajax({
					type: "POST",
					url: "https://iss-island-abendingar.azurewebsites.net/Api/TasksWS",
					processData: false,
					contentType: 'application/json',
					data: JSON.stringify(form),
					success: function(r) {
                        // Það tókst að senda formið!
                        $("#mainContainer").html("<h1>Ábending hefur verið send, takk fyrir!</h1>");
                        $("#mainContainer").append("<button id='anotherSubmission' class='olive-btn ob-form obf2 w-button' type='button'>Senda aðra ábendingu</button>");
                        $("#anotherSubmission").click(function() {
                            $("#mainContainer").html("")
                            start();
                        });  
                    },
                    // Mistókst að senda formið
					error: function(r) {
                        $("#mainContainer").html("<h1>Ekki tókst að senda ábendingu.</h1>");                  
					}
				});
            });
        // Mistókst að sækja formið
		}).error(function(e) {
			$("#mainContainer").html("<h1>Ekki tókst að sækja útfyllingarformið.</h1>");
		});
	});
}