$(document).ready(function () {
    $(document).on("input", "#original, #password", function () {
        $("#urlError").hide();
        $("#create").removeAttr("disabled");
        $("#fileName").html("Generated Link");
    });
    $("#download").click(function () {
        document.location.href = $("#generated").val();
    });
    $("#create").click(function () {
        var regEx = /^https:\/\/www\.fshare\.vn\/file\/.+/;
        var inputURL = regEx.test($("#original").val())
            ? $("#original").val()
            : `https://${$("#original").val()}`;
        var password = $("#password").val();
        if (regEx.test(inputURL)) {
            $("#create")
                .html(
                    `<span class="spinner-border spinner-border-sm ml-4 mr-4" role="status" aria-hidden="true"></span>`
                )
                .attr("disabled", true);
            $.get("/generate", { url: inputURL, password: password }, function (res) {
                $("#create").html("Get Link");
                if (res.code == 200) {
                    $("#generated").val(res.location.replace("fshare.vn", "proxy.phamduy.me").replace("http://", "https://"));
                    $("#fileName").html(
                        `File name: <span class='text-success'>${decodeURI(
                            $("#generated").val().split("/").pop()
                        )}</span>`
                    );
                    $("#copy").removeAttr("disabled");
                    $("#download").removeAttr("disabled");
                } else {
                    $("#copy").prop("disabled", "disabled");
                    $("#download").prop("disabled", "disabled");
                    if (res.code == 123) {
                        $("#generated").val("Invalid file password!");

                    } else if (res.code == 404) {
                        $("#generated").val("File not found!");

                    } else {
                        $("#generated").val("Something went wrong!");
                    }
                }
            });
        } else {
            $("#urlError").show();
        }
    });
    $(".js-textareacopybtn").click(function () {
        var copyTextarea = $(this).data("id");
        $("#" + copyTextarea)[0].select();
        try {
            document.execCommand("copy");
        } catch (err) {
            console.log("Oops, unable to copy");
        }
    });
});