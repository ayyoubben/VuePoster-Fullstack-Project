<template>
    <v-container v-if="post" class="mt-3" flexbox center>
        
        <!--Post Card-->
        <v-layout row wrap>
            <v-flex xs12>
                <v-card hover>
                    <v-card-title>
                        <h1>{{post.title}}</h1>
                        <v-btn @click="handleToggleLike" large icon v-if="user">
                             <v-icon large :color="checkPostLiked(post._id) ? 'accent' : 'grey'">favorite</v-icon>
                        </v-btn>
                        <h3 class="ml-3 font-weight-thin">{{post.likes}} LIKES</h3>
                        <v-spacer></v-spacer>
                        <v-icon @click="goToPrevPage" color="info" large>arrow_back</v-icon>
                    </v-card-title>

                    <v-tooltip right>
                        <span>Click to enlarge image</span>
                        <v-card-media @click="toggleImageDialog" slot="activator" :src="post.imageUrl" id="post__image"></v-card-media>
                    </v-tooltip>

                    <!--Enlarged Post Image-->
                    <v-dialog v-model="dialog">
                        <v-card>
                            <v-card-media :src="post.imageUrl" height="80vh"></v-card-media>
                        </v-card>
                    </v-dialog>

                    <v-card-text>
                        <span v-for="(category, index) in post.categories" :key="index">
                            <v-chip class="mb-3" color="accent" text-color="white">
                                {{category}}
                            </v-chip>
                        </span>
                        <h3>{{post.description}}</h3>
                    </v-card-text>
                  </v-card>
            </v-flex>
        </v-layout>

        <!--Messages Section-->
        <div class="mt-3">
            <!--Mesage Input-->
            <v-layout class="mb-3" v-if="user">
                <v-flex xs12>
                    <v-form v-model="isFormValid" lazy-validation ref="form" @submit.prevent="handleAddPostMessage">
                        <v-layout row>
                            <v-flex xs12>
                                <v-text-field :rules="messageRules" type="text" clearable prepend-icon="add_comment" :append-outer-icon="messageBody && 'send'" @click:append-outer="handleAddPostMessage" label="Add Message" v-model="messageBody" required></v-text-field>  
                            </v-flex>
                        </v-layout>
                    </v-form>
                </v-flex>
            </v-layout>

            <!--Messages-->

            <v-layout row wrap>
                <v-flex xs12>
                    <v-list subheader two-line>
                        <v-subheader>Massages ({{post.messages.length}})</v-subheader>

                        <template v-for="message in post.messages">
                                <v-divider :key="message._id"></v-divider>

                                <v-list-tile avatar inset :key="message.title">
                                    <v-list-tile-avatar>
                                        <img :src="message.messageUser.avatar">
                                    </v-list-tile-avatar>

                                    <v-list-tile-content>
                                        <v-list-tile-title>
                                            {{message.messageBody}}
                                        </v-list-tile-title>
                                        <v-list-tile-sub-title>
                                            {{message.messageUser.username}}
                                            <span class="grey--text text--lighten-1 hidden-xs-only">
                                                {{getTimeFromNow(message.messageDate)}}
                                            </span>
                                        </v-list-tile-sub-title>
                                    </v-list-tile-content>

                                    <v-list-tile-action class="hidden-xs-only">
                                        <v-icon :color="checkIfOwenMessage(message) ? 'accent' : 'grey'" >chat_bubble</v-icon>
                                    </v-list-tile-action>

                                </v-list-tile>
                        </template>

                    </v-list>
                </v-flex>
            </v-layout>

        </div>

    </v-container> 
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import { ADD_POST_MESSAGE, GET_POST, LIKE_POST, UNLIKE_POST } from '../../queries'
export default{
    name: 'Post',
    props: ['postId'],
    data() {
        return {
            postLiked: false,
            dialog: false,
            messageBody: '',
            isFormValid: true,
            messageRules: [
                message => !!message || 'Message is required',
                message => message.length < 100 || 'Message must be less then 100 characters'
            ]
        }
    },
    created() {
        this.handleGetPost()
    },
    computed: {
        ...mapGetters(['loading', 'user', 'post', 'userFavorites'])
    },
    methods: {
        getTimeFromNow(time) {
            return moment(new Date(time)).fromNow()
        },
        checkPostLiked(postId) {
            if(this.userFavorites && this.userFavorites.some(fave => fave._id === postId)) {
                this.postLiked = true
                return true
            } else {
                this.postLiked = false
                return false
            }
        },
        handleToggleLike() {
            if(this.postLiked) {
                this.handleUnlikePost()
            } else {
                this.handleLikePost()
            }
        },
        handleGetPost() {
            this.$store.dispatch('getPost', {
                _id: this.$props.postId
            })
        },
        goToPrevPage() {
            this.$router.go(-1)
        },
        toggleImageDialog() {
            if(window.innerWidth > 500) {
                this.dialog = !this.dialog
            }
        },
        handleAddPostMessage() {
            if (this.$refs.form.validate()) {
                const variables = {
                    messageBody: this.messageBody,
                    userId: this.user._id,
                    postId: this.post._id
                }
                this.$apollo.mutate({
                    mutation: ADD_POST_MESSAGE,
                    variables,
                    update: (cache, {data: {addPostMessage}}) => {
                        const data = cache.readQuery({
                            query: GET_POST,
                            variables: {
                                _id: this.$props.postId
                            }
                        })
                        data.getPost.messages.unshift(addPostMessage)
                        cache.writeQuery({
                            query: GET_POST,
                            variables: {
                                _id: this.$props.postId
                            },
                            data
                        })
                    }
                }).then(({data}) => {
                    this.$refs.form.reset()
                    console.log(data.addPostMessage)
                }).catch(e => {
                    console.error(e)
                })
            }
        },
        checkIfOwenMessage(message) {
            return this.user && message.messageUser._id === this.user._id 
        },
        handleLikePost() {
            const variables = {
                postId: this.$props.postId,
                username: this.user.username
            }
            this.$apollo.mutate({
                mutation: LIKE_POST,
                variables,
                update: (cache, {data: {likePost}}) => {
                    const data = cache.readQuery({
                        query: GET_POST,
                        variables: {
                            _id: this.$props.postId
                        }
                    })
                    data.getPost.likes += 1
                    cache.writeQuery({
                        query: GET_POST,
                        variables: {
                            _id: this.$props.postId
                        },
                        data
                    })
                    this.$store.commit('setPost', data.getPost)
                }
            }).then(({data}) => {
                const updatedUser = {...this.user, favorites: data.likePost.favorites}
                this.$store.commit('setUser', updatedUser)
            }).catch(e => {
                console.error(e)
            })
        },
        handleUnlikePost() {
            const variables = {
                postId: this.postId,
                username: this.user.username
            }
            this.$apollo
                .mutate({
                    mutation: UNLIKE_POST,
                    variables,
                    update: (cache, { data: { unlikePost } }) => {
                      const data = cache.readQuery({
                        query: GET_POST,
                        variables: { _id: this.postId }
                      })
                      data.getPost.likes -= 1
                      cache.writeQuery({
                        query: GET_POST,
                        variables: { _id: this.postId },
                        data
                      })
                      this.$store.commit('setPost', data.getPost)
                    }
                })
                .then(({ data }) => {
                    const updatedUser = {
                      ...this.user,
                      favorites: data.unlikePost.favorites
                    };
                    this.$store.commit("setUser", updatedUser);
                })
                .catch(e => console.error(e));
        }
    }
}
</script>

<style scoped>
#post__image {
  height: 400px !important;
}
</style>