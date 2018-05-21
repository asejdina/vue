var eventBus = new Vue()

  Vue.component('product-tabs', {
    props: {
      details: {
        type: Array,
        required: false,
      }
    },
    template: `
      <div>

        <div>
          <span class="tab"
                v-for="(tab, index) in tabs"
                @click="selectedTab = tab"
                :class="{ activeTab: selectedTab === tab }"
          >{{ tab }}</span>
        </div>

        <div>
            <p v-if="!reviews.length">There are no reviews yet.</p>
            <ul v-else>
                <li v-for="(review, index) in reviews" :key="index">
                  <p>{{ review.name }}</p>
                  <p>Rating:{{ review.rating }}</p>
                  <p>{{ review.review }}</p>
                </li>
            </ul>
        </div>

        <div v-show="selectedTab === 'Make a Review'">
          <product-review></product-review>
        </div>

      </div>
    `,
    data() {
      return {
        tabs: ['Reviews', 'Make a Review'],
        selectedTab: 'Reviews' // set from @click
      }
    }
  })


Vue.component('product-review',{
  template: `
    <form class="review-form" @submit.prevent="onSubmit">
      <p>
        <label for="name">Name:</label>
        <input id="name" v-model="name" placeholder="name">
      </p>

      <p>
        <label for="review">Review:</label>
        <textarea id="review" v-model="review"></textarea>
      </p>

      <p>
        <label for="rating">Rating:</label>
        <select id="rating" v-model.number="rating">
          <option>5</option>
          <option>4</option>
          <option>3</option>
          <option>2</option>
          <option>1</option>
        </select>
      </p>

      <p v-if="errors.length">
        <b>Please correct the following error(s):</b>
        <ul>
          <li v-for="error in errors">{{ error }}</li>
        </ul>
      </p>

      <p>
        <input type="submit" value="Submit">
      </p>

    </form>
  `,
  data(){
    return {
      name:null,
      review:null,
      rating:null,
      errors: []
    }
  },
  methods: {
    onSubmit() {
      if(this.name && this.review && this.rating) {
        let productReview = {
          name: this.name,
          review: this.review,
          rating: Number(this.rating)
        }
        eventBus.$emit('review-submitted', productReview)
        this.name = null
        this.review = null
        this.rating = null
      } else {
        if(!this.name) this.errors.push("Name required.")
        if(!this.review) this.errors.push("Review required.")
        if(!this.rating) this.errors.push("Rating required.")
      }
    }
  }
})

Vue.component('productdetails',{
  props: {
    details: {
      type: Array,
      required: true,
    }
  },
  template: `
    <ul>
      <li v-for="detail in details">{{ detail }}</li>
    </ul>
  `,

})

Vue.component('product',{
  props: {
    premium: {
      type: Boolean,
      required: true,
    }
  },
  template: `
    <div class="product">

      <div class="product-image">
        <img :src="image" >
      </div>


      <div class="product-info">
        <h1>{{ title }}</h1>
        <p v-if="inStock">In Stock</p>
        <p v-else
           :class="{outOfStock:!inStock}">Out of Stock</p>
        <p>{{ sale }}</p>
        <p>Shipping: {{ shipping }}</p>

        <ul>
          <li v-for="size in sizes">{{ size }}</li>
        </ul>

        <productdetails :details="details"></productdetails>

        <div  v-for="(variant, index) in variants"
              :key="variant.variantId"
              class="color-box"
              :style="{backgroundColor: variant.variantColor}"
               @mouseover="updateProduct(index)">
        </div>
      </div>

      <button @click="addToCart"
              :disabled="!inStock"
              :class="{disabledButton: !inStock}">Add to Cart</button>

      <button @click="removeFromCart">Subtract from Cart</button>



      <product-tabs :reviews="reviews"></product-tabs>


    </div>
  `,
  data() {
    return {
      product: 'Socks',
      brand: 'Vue Mastery',
      details: ["80% cotton", "20% polyester", "Gender-neutral"],
      onSale: true,
      description: 'These are some pretty cool socks.',
      selectedVariant: 0,
      onSale: true,
      variants: [
        {
          variantId: 2234,
          variantColor: "green",
          variantImage: './vmSocks-green.jpeg',
          variantQuantity: 10,
        },
        {
          variantId: 2235,
          variantColor: "blue",
          variantImage: './vmSocks-blue.jpeg',
          variantQuantity: 0,
        },
      ],
      sizes: ["S","M","L","XL"],
      reviews: []
    }
  },
  methods: {
    addToCart(){
      this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
    },
    updateProduct(index){
      this.selectedVariant = index
    },
    removeFromCart(){
      this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId)
    },
    mounted() {
      eventBus.$on('review-submitted', productReview => {
        this.reviews.push(productReview)
      })
    }
  },
  computed: {
    title() {
      return this.brand + ' ' + this.product
    },
    image(){
      return this.variants[this.selectedVariant].variantImage
    },
    inStock(){
      return this.variants[this.selectedVariant].variantQuantity
    },
    sale(){
      if(this.onSale){
        return this.brand + ' ' + this.product + 'are on sale!'
      } else {
        return this.brand + ' ' + this.product + 'are not on sale.'
      }
    },
    shipping(){
      if(this.premium){
        return "Free"
      }
      return 2.99
    }
  }
})



var app = new Vue({
  el: '#app',
  data: {
    premium: true,
    cart: [],
  },
  methods: {
    updateCart(id){
      this.cart.push(id)
    },
    removeItem(id) {
      for(var i = this.cart.length - 1; i >= 0; i--) {
        if (this.cart[i] === id) {
           this.cart.splice(i, 1);
        }
      }
    }
  },

})
