import LineItem = require('./LineItem');
import Money = require('../value/Money');
import LineItemCtnr = require('./LineItemCtnr');
import ABTest = require('../campaign/ABTest');
import ABTestSegment = require('../campaign/ABTestSegment');
import Discount = require('../campaign/Discount');
import EnumValue = require('../value/EnumValue');
import Campaign = require('../campaign/Campaign');
import CouponLineItem = require('./CouponLineItem');
import Promotion = require('../campaign/Promotion');
import ProductLineItem = require('./ProductLineItem');
import Map = require('../util/Map');



/**
 * The PriceAdjustment class represents an adjustment to the price of an order. A PriceAdjustment can apply to a ProductLineItem, ShippingLineItem, ProductShippingLineItem, or a LineItemCtnr, and are generally categorized as product-level, shipping-level, or order-level. PriceAdjustments are generated by the Commerce Cloud Digital promotions engine when applying discounts. See PromotionMgr.applyDiscounts(DiscountPlan). They may also be generated by custom code through the API. See for example ProductLineItem.createPriceAdjustment(string). In the latter case, the PriceAdjustment is called "custom"; in the former case, it is called "system". System price adjustments are associated with the promotion that triggered their creation. If the promotion was coupon-based, then the price adjustment will additionally be associated with a coupon line item in the LineItemCtnr.
 */
declare class PriceAdjustment extends LineItem {
    /**
     * The AB-test this price adjustment is associated with. The associated AB-test is determined from the ABTestID attribute which is set by the promotions engine when applying discounts.

If the AB-test has been removed from the system since this price adjustment was created, this method returns null. This method always returns null for custom price adjustments.
     */
    readonly ABTest  :  ABTest | null

    /**
     * The ID of the AB-test related to this price adjustment.
     */
    readonly ABTestID  :  string

    /**
     * The Commerce Cloud Digital AB-test segment this price adjustment is associated with. The associated AB-test segment is determined from the ABTestSegmentID attribute which is set by the promotions engine when applying discounts.

If the AB-test, or this segment, has been removed from the system since this price adjustment was created, this method returns null. This method always returns null for custom price adjustments.
     */
    readonly ABTestSegment  :  ABTestSegment | null

     /**
      * The ID of the AB-test segment related to this price adjustment.
      */
    readonly ABTestSegmentID  :  string

    /**
     * A Discount instance describing the discount applied to obtain this price-adjustment. This method only returns a non-null value if the price-adjustment was created

        1. when a discount-plan was applied to a basket, or
        2. as a custom price-adjustment using one of the methods ProductLineItem.createPriceAdjustment(string, Discount), ShippingLineItem.createShippingPriceAdjustment(string, Discount) or LineItemCtnr.createPriceAdjustment(string, Discount).

    Note an instance of the Discount subclasses is returned, such as AmountDiscount or PriceBookPriceDiscount, use Discount.getType() and the constants in Discount to distinguish between types. Each subclass provides access to specific properties.
    */
    readonly appliedDiscount  :  Discount

    /**
     * Returns true if the price adjustment was generated by the Commerce Cloud Digital promotions engine when applying a promotion assigned to an AB-test.
     */
    readonly basedOnABTest  :  boolean

    /**
     * Identifies if the promotion line item results from a coupon.
     */
    readonly basedOnCoupon  :  boolean

    /**
     * The Commerce Cloud Digital campaign this price adjustment is associated with. The associated campaign is determined from the campaignID attribute which is set by the promotions engine when applying discounts.
     * If the campaign has been removed from the system since this price adjustment was created, this method returns null. This method always returns null for custom price adjustments.

    Note: If the price adjustment was generated by a Commerce Cloud Digital promotion as part of an AB-test, then a Campaign object will be returned, but it is a mock implementation, and not a true Campaign. This behavior is required for backwards compatibility and should not be relied upon as it may change in future releases.
    */
    readonly campaign  :  Campaign | null


    /**
     * The ID of the campaign the price adjustment was based on.
     *
     * Note:If the price adjustment was generated by a Commerce Cloud Digital promotion as part of an AB-test, then an ID will be returned but it is not the ID of a true campaign. This behavior is required for backwards compatibility and should not be relied upon as it may change in future releases.
     */
    readonly campaignID  :  string


    /**
     * The coupon line item related to this price adjustment. If the price adjustment is not based on a coupon, null is returned.
     */
    readonly couponLineItem  :  CouponLineItem
    /**
     * The name of the user who created the price adjustment. This method returns a value if the price-adjustment was created as a custom price-adjustment using one of the methods ProductLineItem.createPriceAdjustment(string, Discount), ShippingLineItem.createShippingPriceAdjustment(string, Discount) or LineItemCtnr.createPriceAdjustment(string, Discount).

    If an agent user has created the price adjustment, the agent user's name is returned. Otherwise "Customer" is returned.
    */
    readonly createdBy  :  string
    /**
     * Returns true if this PriceAdjustment was created by custom script code.
     */
    //readonly custom  :  boolean
    // FIXME: find way properly extend LineItem

    /**
     * Returns true if this PriceAdjustment was added manually by a user.

    A manual PriceAdjustment is one which has been added as a result of a user interaction e.g. by a user editing an order.

    A non-manual PriceAdjustment is one which has been added for a different reason, e.g. by custom logic which automatically adjusts the price of particular products when certain conditions are met.
    */
    readonly manual  :  boolean

    /**
     * The promotion associated with this price adjustment. The associated promotion is determined from the promotionID and campaignID attributes which are set by the promotions engine when applying discounts. Alternatively if the promotion applied as part of an AB-test, then the associated promotion is determined from the promotionID attribute and the hidden attributes, abTestID and abTestGroupID.

    If the promotion has been removed from the system since this price adjustment was created, or if the promotion still exists but is not assigned to any campaign or AB-test, this method returns null. If the promotion has been reassigned to a different campaign or AB-test since this price adjustment was created, then the system will return an appropriate Promotion instance. This method always returns null for custom price adjustments.
    */
    readonly promotion  :  Promotion | null
    /**
     * The ID of the promotion related to this price adjustment.
     */
    readonly promotionID  :  string | null
    /**
     * A map representing the product line items to which this price adjustment is "related" (in the sense defined below) and the portion of this adjustment's price which applies to each after discount prorating is performed. This information is sometimes useful to display in the storefront but is more often useful for integrating with backend order-management and accounting systems which require all discounts to be itemized.

    The definition of "related" product line items depends on the type of promotion which generated this price adjustment:

        1. For order promotions, price adjustments are prorated across all product line items which are not explicitly excluded by the promotion. Custom order price adjustments apply to all items in the LineItemCtnr.
        2. For Buy-X-Get-Y product promotions, price adjustments are prorated across all items all product line items that are involved in the promotion, meaning that the PLI has one or more items contributing to the qualifying product count (i.e. the item is one of the X) or receiving the discount (i.e. the item is one of the Y).
        3. Other product promotions are not prorated and simply adjust the parent product line item, and so the returned map is of size 1.
        4. For shipping promotions, this method returns an empty map.

    Buy-X-Get-Y product promotions are prorated as follows: Each price adjustment generated by the promotion is sequentially prorated upon the related items according to the items' adjusted prices after all non-BOGO product promotions are considered, but before order promotions are considered.

    Order promotions are prorated sequentially upon non-excluded items according to the order in which they applied during promotion processing.

    The values in the map are inclusive of tax if this price adjustment is based on gross pricing, and exclusive of tax otherwise. The sum of the prorated prices always equals the price of this price adjustment.
    */
    readonly proratedPrices  :  Map<ProductLineItem, Money>

    /**
     * The number of items this price adjustment applies to. This value is always equal to 1 for price adjustments generated by order or shipping promotions. For price adjustments generated by product promotions, this value represents the number of units of the parent product line item to which the adjustment applies. Because promotions may have a maximum number of applications this value may be less than the product line item quantity.

    For custom price adjustments, not generated by the promotions engine, this method always returns 0.
    */
    readonly quantity  :  number

    /**
     * The reason code of the price adjustment. The list of available reason codes is editable system meta-data. An example for using the reason code is that in a call center application the CSR will explain why he gave a discount to the customer.
     */
    readonly reasonCode  :  EnumValue<string>


    /**
     * Returns the Commerce Cloud Digital AB-test this price adjustment is associated with.
     */
    getABTest() : ABTest

    /**
     * Returns the ID of the AB-test related to this price adjustment.
     */
    getABTestID() : string

    /**
     * Returns the Commerce Cloud Digital AB-test segment this price adjustment is associated with.
     */
    getABTestSegment() : ABTestSegment

    /**
     * Returns the ID of the AB-test segment related to this price adjustment.
     */
    getABTestSegmentID() : string

    /**
     * A Discount instance describing the discount applied to obtain this price-adjustment.
     */
    getAppliedDiscount() : Discount

    /**
     * Returns the Commerce Cloud Digital campaign this price adjustment is associated with.
     */
    getCampaign() : Campaign

    /**
     * Returns the ID of the campaign the price adjustment was based on.
     */
    getCampaignID() : string

    /**
     * Returns the coupon line item related to this price adjustment.
     */
    getCouponLineItem() : CouponLineItem

    /**
     * Returns the name of the user who created the price adjustment.
     */
    getCreatedBy() : string

    /**
     * Returns the promotion associated with this price adjustment.
     */
    getPromotion() : Promotion

    /**
     * Returns the ID of the promotion related to this price adjustment.
     */
    getPromotionID() : string

    /**
     * Returns a map representing the product line items to which this price adjustment is "related" (in the sense defined below) and the portion of this adjustment's price which applies to each after discount prorating is performed.
     */
    getProratedPrices() : Map<ProductLineItem, Money>

    /**
     * Returns the number of items this price adjustment applies to.
     */
    getQuantity() : number

    /**
     * Returns the reason code of the price adjustment.
     */
    getReasonCode() : EnumValue<string>

    /**
     * Returns true if the price adjustment was generated by the Commerce Cloud Digital promotions engine when applying a promotion assigned to an AB-test.
     */
    isBasedOnABTest() : boolean

    /**
     * Identifies if the promotion line item results from a coupon.
     */
    isBasedOnCoupon() : boolean

    /**
     * @deprecated The method has been deprecated since the name implies that there is a related Campaign, which may not be true. Use !isCustom() instead.
     */
    isBasedOnCampaign() : boolean

    /**
     * Returns true if this PriceAdjustment was created by custom script code.
     */
    isCustom() : boolean

    /**
     * Returns true if this PriceAdjustment was added manually by a user.
     */
    isManual() : boolean

    /**
     * Marks the current PriceAdjustment as manual/non-manual.
     * @param aFlag
     */
    setManual(aFlag : boolean) : void

    /**
     * Set the reason code, using the internal non-localizable value.
     * @param reasonCode
     */
    setReasonCode(reasonCode : string) : void

}

export = PriceAdjustment;
