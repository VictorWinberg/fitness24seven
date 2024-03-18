const fetch = require("node-fetch");

module.exports = ({ apiUrl, token }) => {
  async function graphql({ operationName, query, variables }) {
    const res = await fetch(apiUrl, {
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ operationName, query, variables }),
    });
    const json = await res.json();
    return json.data[operationName];
  }

  return {
    getTimeSlotsNew: (siteId) =>
      graphql({
        operationName: "getTimeSlotsNew",
        variables: {
          timeSlotQuery: {
            siteIds: [siteId],
            locale: "en-US",
            includeBookedTimeSlots: true,
          },
        },
        query:
          "fragment bookingFragment on BookingNew {\n  id\n  timeSlotId\n  cancelled\n  checkIn\n  isNoShow\n  isInQueue\n  queueNumber\n  __typename\n}\n\nfragment timeSlotFragment on TimeSlotNew {\n  id\n  queueCount\n  cancelled\n  message\n  activity {\n    id\n    name\n    slug\n    description\n    image\n    categories {\n      name\n      __typename\n    }\n    pictogram {\n      neg {\n        url\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  room\n  instructor {\n    name\n    __typename\n  }\n  duration {\n    start\n    end\n    __typename\n  }\n  maxBookings\n  currentBookings\n  site {\n    id\n    name\n    shippingAddress {\n      city\n      country\n      __typename\n    }\n    __typename\n  }\n  memberBooking {\n    ...bookingFragment\n    __typename\n  }\n  __typename\n}\n\nquery getTimeSlotsNew($timeSlotQuery: TimeSlotQuery!) {\n  getTimeSlotsNew(query: $timeSlotQuery) {\n    ...timeSlotFragment\n    __typename\n  }\n}",
      }),
    getTimeSlotNew: (timeSlotId) =>
      graphql({
        operationName: "getTimeSlotNew",
        variables: {
          locale: "en-US",
          id: timeSlotId,
        },
        query:
          "fragment bookingFragment on BookingNew {\n  id\n  timeSlotId\n  cancelled\n  checkIn\n  isNoShow\n  isInQueue\n  queueNumber\n  __typename\n}\n\nfragment timeSlotFragment on TimeSlotNew {\n  id\n  queueCount\n  cancelled\n  message\n  activity {\n    id\n    name\n    slug\n    description\n    image\n    categories {\n      name\n      __typename\n    }\n    pictogram {\n      neg {\n        url\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  room\n  instructor {\n    name\n    __typename\n  }\n  duration {\n    start\n    end\n    __typename\n  }\n  maxBookings\n  currentBookings\n  site {\n    id\n    name\n    shippingAddress {\n      city\n      country\n      __typename\n    }\n    __typename\n  }\n  memberBooking {\n    ...bookingFragment\n    __typename\n  }\n  __typename\n}\n\nquery getTimeSlotNew($id: Int!, $locale: String) {\n  getTimeSlotNew(id: $id, locale: $locale) {\n    ...timeSlotFragment\n    __typename\n  }\n}",
      }),
    createNewBooking: (timeSlotId) =>
      graphql({
        operationName: "createNewBooking",
        variables: {
          timeSlotId,
        },
        query:
          "fragment bookingFragment on BookingNew {\n  id\n  timeSlotId\n  cancelled\n  checkIn\n  isNoShow\n  isInQueue\n  queueNumber\n  __typename\n}\n\nmutation createNewBooking($timeSlotId: Int!) {\n  createNewBooking(timeSlotId: $timeSlotId) {\n    booking {\n      ...bookingFragment\n      __typename\n    }\n    isSuccessful\n    errorCode\n    __typename\n  }\n}",
      }),
    cancelNewBooking: (timeSlotId) =>
      graphql({
        operationName: "cancelNewBooking",
        variables: {
          timeSlotId,
        },
        query:
          "mutation cancelNewBooking($timeSlotId: Int!) {\n  cancelNewBooking(timeSlotId: $timeSlotId) {\n    isSuccessful\n    errorCode\n    __typename\n  }\n}",
      }),
    getSiteReferences: () =>
      graphql({
        operationName: "getSiteReferences",
        variables: {
          orderBy: {
            name: "ASC",
          },
          filter: {
            channel: "APP",
            deleted: false,
          },
        },
        query:
          "query getSiteReferences($orderBy: GetSiteReferencesOrderBy, $filter: SiteReferencesQuery) {\n  getSiteReferences(orderBy: $orderBy, filter: $filter) {\n    id\n    name\n    shippingAddress {\n      countryCode\n      __typename\n    }\n    __typename\n  }\n}",
      }),
    getBookingRules: () =>
      graphql({
        operationName: "getBookingRules",
        variables: {},
        query:
          "query getBookingRules {\n  getBookingRules {\n    bookableHoursBeforeStart\n    daysNoShowBan\n    daysToCheckPreviousNoShows\n    maxBookingsPerDay\n    maxConcurrentBookings\n    minutesBeforeBookingCloses\n    minutesBeforeCancellationDeadline\n    minutesBeforeCancellationWhenBeenInQueue\n    minutesBeforeCheckinDeadline\n    minutesBeforeDropInOpens\n    minutesBeforeQueueCloses\n    minutesEntriesLast\n    noShowThreshold\n    __typename\n  }\n}",
      }),
    getMember: (id) =>
      graphql({
        operationName: "getMember",
        variables: {
          memberQuery: {
            id,
          },
        },
        query:
          "fragment statisticsFragment on MemberStatistics {\n  totalVisits\n  sites {\n    siteId\n    siteName\n    countryId\n    countryName\n    visits\n    __typename\n  }\n  monthly {\n    year\n    month\n    visits\n    __typename\n  }\n  weekly {\n    year\n    week\n    visits\n    __typename\n  }\n  __typename\n}\n\nquery getMember($memberQuery: MemberQuery!) {\n  getMember(query: $memberQuery) {\n    id\n    firstName\n    lastName\n    customerNumber\n    loyaltyStatus\n    email\n    market\n    acceptedAppTerms\n    hasUnpayedSubscriptionInvoice\n    hasNoShowBanUntil\n    mobilePhone {\n      countryCode\n      number\n      __typename\n    }\n    subscriptions {\n      isActive\n      productName\n      price\n      currencyCode\n      freezePeriodEnd\n      freezePeriodStart\n      __typename\n    }\n    shippingAddress {\n      street\n      postalCode\n      city\n      country\n      countryCode\n      __typename\n    }\n    consent {\n      allowMassSendMail\n      allowMassSendEmail\n      allowMassSendSms\n      __typename\n    }\n    statistics {\n      ...statisticsFragment\n      __typename\n    }\n    mySite {\n      id\n      name\n      shippingAddress {\n        street\n        city\n        postalCode\n        country\n        countryCode\n        __typename\n      }\n      email\n      phoneNumber\n      coordinatesLat\n      coordinatesLon\n      googlePlaceId\n      staffedHours {\n        weekday\n        from\n        to\n        __typename\n      }\n      __typename\n    }\n    suspended\n    __typename\n  }\n}",
      }),
  };
};
