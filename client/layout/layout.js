/**
 * Created by dandi on 9/24/16.
 */
Template.website.onRendered(() => {
    let divHeight = $(window).height() - 64;
    $('.content').css("height", divHeight + "px");
    $(window).resize(function () {
        divHeight = $(window).height() - 64;
        $('.content').css("height", divHeight + "px");
    });
});