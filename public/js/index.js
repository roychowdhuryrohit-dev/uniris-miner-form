$(function () {

    $("#submit-btn").on("click", function () {
        var name, email, addr, ctype;

        name = $("#name").val();
        email = $("#email").val();
        // addr = $("#wallet-address").val();
        // ctype = $("input[name='connection-type']:checked").val();

        if (name === "" || email === "") {
            alert("Fill all field!");
            return;
        }

        $.ajax({
            type: "POST",
            url: "submit",
            contentType: "application/json",
            data: JSON.stringify({ name: name, email: email, address: addr, connectionType: ctype }),
            processData: false
        }).done(function () {
            alert("Submitted successfully!");
            $("#name").val("");
            $("#email").val("");
            // $("#wallet-address").val("");
            // $("input[name='connection-type']").prop("checked", false);
        }).fail(function (xhr, status, error) {
            if (xhr.status === 400) {
                alert(xhr.responseText);
            } else {
                alert("Failed to submit!");
            }
        });


    });
});