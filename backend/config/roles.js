const allRoles = {
    user: ['readServices', 'postRequest', 'manageOwnProfile', 'submitFeedback', 'raiseDispute', 'raiseTicket'],
    serviceProvider: ['manageOwnListings', 'manageleads', 'manageOwnAds', 'viewOwnReports', 'manageOwnProfile', 'raiseDispute', 'raiseTicket'],
    superAdmin: ['getUsers', 'manageUsers', 'manageProviders', 'manageServices', 'manageSubscriptions', 'manageAds', 'managePayments', 'manageDisputes', 'manageReports', 'manageCommunications', 'manageFeedback', 'manageTickets', 'manageStaff', 'manageInventory', 'manageCommunity', 'manageRoles', 'manageSettings'],
    subAdmin: ['getUsers', 'manageUsers', 'manageProviders', 'manageServices', 'manageSubscriptions', 'manageAds', 'managePayments', 'manageDisputes', 'manageReports', 'manageCommunications', 'manageFeedback', 'manageTickets', 'manageCommunity'],
    contentManager: ['readContent', 'approveContent', 'manageContent'],
    contentCreator: ['readContent', 'createContent'],
    staff: ['readServices', 'manageTickets', 'readReports'],
    helpSupport: ['manageTickets', 'readUsers', 'manageFeedback'],
    accountant: ['managePayments', 'manageReports', 'viewFinancials'],
    inventoryManager: ['manageInventory', 'readReports'],
    hrManager: ['manageStaff', 'manageReports'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
    roles,
    roleRights
};