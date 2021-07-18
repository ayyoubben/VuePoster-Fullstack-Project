<template>
    <v-container class="text-xs-content">

        <!--User Details Card-->
        <v-flex sm6 offset-sm3>
            <v-card class="white--text" color="secondary">
                <v-layout>
                    <v-flex xs5>
                        <v-card-media contain height="125px" :src="user.avatar"></v-card-media>
                    </v-flex>
                    <v-flex xs7>
                        <v-card-title primary-title>
                            <div>
                                <div class="headline">{{user.username}}</div>
                                <div>Joined {{formatJoinDate(user.joinDate)}}</div>
                                <div class="hidden-xs-only font-weight-thin">{{user.favorites.length}} Favorites</div>
                                <div class="hidden-xs-only font-weight-thin">{{userPosts.length}} Posts Added</div>
                            </div>
                        </v-card-title>
                    </v-flex>
                </v-layout>
            </v-card>
        </v-flex>

        <!--Post Favorited by user-->
        <v-container v-if="!userFavorites.length">
            <v-layout row wrap>
                <v-flex xs12>
                    <h2>You have no favorites currently. Go and add some!</h2>
                </v-flex>
            </v-layout>
        </v-container>
        
        <v-container class="mt-3" v-else>
            <v-flex xs12>
                <h2 class="font-weight-light">
                    Favorited
                    <span class="font-weight-regular">({{userFavorites.length}})</span>
                </h2>
            </v-flex>
            <v-layout row wrap>
                <v-flex xs12 sm6 v-for="favorite in userFavorites" :key="favorite._id">
                    <v-card class="mt-3 ml-1 mr-2" hover>
                        <v-card-media @click="goToPost(favorite._id)" height="30vh" :src="favorite.imageUrl"></v-card-media>
                        <v-card-text>
                        {{favorite.title}}
                        </v-card-text>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>

        <!--Posts Created by user-->
        <v-container v-if="!userPosts.length">
            <v-layout row wrap>
                <v-flex xs12>
                    <h2>You have no posts currently. Go and add some!</h2>
                </v-flex>
            </v-layout>
        </v-container>

        <v-container class="mt-3" v-else>
            <v-flex xs12>
                <h2 class="font-weight-light">
                    Your Posts
                    <span class="font-weight-regular">({{userPosts.length}})</span>
                </h2>
            </v-flex>
            <v-layout row wrap>
                <v-flex xs12 sm6 v-for="post in userPosts" :key="post._id">
                    <v-card class="mt-3 ml-1 mr-2" hover>
                        <v-btn @click="loadPost(post)" floating fab small dark color="info">
                            <v-icon>edit</v-icon>
                        </v-btn>
                        <v-btn @click="handleDeleteUserPost(post)" floating fab small dark color="error">
                            <v-icon>delete</v-icon>
                        </v-btn>
                        <v-card-media @click="goToPost(post._id)" height="30vh" :src="post.imageUrl"></v-card-media>
                        <v-card-text>
                        {{post.title}}
                        </v-card-text>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>

        <!--Edit Post Dialog-->
        <v-dialog x12 sm6 offset-sm3 persistent v-model="editPostDialog">
            <v-card  style="background: #EFEBE9">
                <v-card-title class="headline grey lighten-3">
                    Update Post
                </v-card-title>
                <v-container>
                    <v-form v-model="isFormValid" lazy-validation ref="form" @submit.prevent="handleUpdateUserPost">

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

                        <v-divider></v-divider>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn :disabled="!isFormValid" type="submit" class="success--text" flat>Update</v-btn>
                            <v-btn class="error--text" flat @click="editPostDialog = false">Cancel</v-btn>
                            
                        </v-card-actions>

                    </v-form>
                </v-container>
            </v-card>    
        </v-dialog>
    </v-container>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
export default {
    name: 'Profile',
    data() {
        return {
            editPostDialog: false,
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
        ...mapGetters(['user', 'userFavorites', 'userPosts'])
    },
    created() {
        this.handleGetUserPosts()
    },
    methods: {
        goToPost(id) {
            this.$router.push(`/posts/${id}`)
        },
        formatJoinDate(date) {
            return moment(new Date(date)).format('ll')
        },
        handleGetUserPosts() {
            this.$store.dispatch('getUserPosts', {
                userId: this.user._id
            })
        },
        handleUpdateUserPost() {
            if (this.$refs.form.validate()) {
                this.$store.dispatch('updateUserPost', {
                    postId: this.postId,
                    userId: this.user._id,
                    title: this.title,
                    imageUrl: this.imageUrl,
                    categories: this.categories,
                    description: this.description
                })
                this.editPostDialog = false
            }
        },
        handleDeleteUserPost(post) {
            this.loadPost(post, false)
            const deletePost = window.confirm('Are you sure you want to delete this post?')
            if (deletePost) {
                this.$store.dispatch('deleteUserPost', {
                    postId: this.postId
                })
            }
        },
        loadPost({_id, title, imageUrl, categories, description}, editPostDialog = true) {
            this.editPostDialog = editPostDialog
            this.postId = _id
            this.title = title
            this.imageUrl = imageUrl
            this.categories = categories
            this.description = description
        }
    }
}
</script>