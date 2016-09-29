/**
 * Created by dandi on 9/24/16.
 */
BlazeLayout.setRoot('body');

FlowRouter.route('/',{

    action: () => {
        BlazeLayout.render("website", {content:"home"})
    }

});