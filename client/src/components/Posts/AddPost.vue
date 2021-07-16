<template>
    <v-container text-xs-center mt-5 pt-5>
        <!--Add Post Title-->
        <v-layout row wrap>
            <v-flex xs12 sm6 offset-sm3>
                <h1 class="primary--text">Add Post</h1>
            </v-flex>
        </v-layout>

        <!--Add Post Form-->
        <v-layout row wrap>
            <v-flex xs12 sm6 offset-sm3>
                
                        <v-form v-model="isFormValid" lazy-validation ref="form" @submit.prevent="handleAddPost">

                            <!--Title Post Input-->
                            <v-layout row>
                              <v-flex xs12>
                                <v-text-field :rules="titleRules" v-model="title" label="Post Title" type="text" required></v-text-field>
                              </v-flex>
                            </v-layout>

                            <!--Image url Input-->
                            <v-layout row>
                              <v-flex xs12>
                                <v-text-field :rules="imageRules" v-model="imageUrl" label="Image URL" type="text" required></v-text-field>
                              </v-flex>
                            </v-layout>

                            <!--Image Preview-->
                            <v-layout row>
                                <v-flex xs12>
                                    <img :src="imageUrl" height="300px">
                                </v-flex>
                            </v-layout>

                            <!--Categories-->
                            <v-layout row>
                              <v-flex xs12>
                                <v-select :rules="categoriesRules" v-model="categories" :items="['Art', 'Education', 'Travel', 'Photography', 'Technology', 'Furniture', 'Food']" multiple label="Categories"></v-select>
                              </v-flex>
                            </v-layout>

                            <!--Description Text area-->
                            <v-layout row>
                              <v-flex xs12>
                                <v-textarea :rules="descRules" v-model="description" label="Description" type="text" required></v-textarea>
                              </v-flex>
                            </v-layout>

                            <v-layout row>
                              <v-flex xs12>
                                    <v-btn :loading="loading" :disabled="!isFormValid || loading" color="secondary" type="submit">
                                        <span slot="loader" class="custom-loader">
                                            <v-icon light>cached</v-icon>
                                        </span>
                                        Submit
                                    </v-btn>

                              </v-flex>
                            </v-layout>

                        </v-form>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import {mapGetters} from 'vuex'
export default {
  name: 'AddPost',
  data() {
    return {
        isFormValid: true,
        title: '',
        imageUrl: '',
        categories: [],
        description: '',
        titleRules: [
            title => !!title || 'Title is required',
            title => title.length < 20 || 'Title must be less than 20 characters'
        ],
        imageRules: [
            imageUrl => !!imageUrl || 'Image URL is required'
        ],
        categoriesRules: [
            categories => categories.length >= 1 || 'At least one category is required'
        ],
        descRules: [
            description => !!description || 'Description is required',
            description => description.length < 200 || 'Description must be less than 200 characters'
        ],
    }
  },
  computed: {
    ...mapGetters(['user', 'loading'])
  },
  methods: {
    handleAddPost() {
      if (this.$refs.form.validate()) {
        this.$store.dispatch('addPost', {
          title: this.title,
          imageUrl: this.imageUrl,
          categories: this.categories,
          description: this.description,
          creatorId: this.user._id
        })
        this.$router.push('/')
      }
    }
  }
}
</script>