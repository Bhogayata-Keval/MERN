const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// router.get('/test', (req, res) => res.json({msg:'test success'}));
const Post = require('../../models/Post');

const Profile = require('../../models/Profile');

const validatePostInput = require('../../validation/posts');

// @route  POST /api/posts
// @desc   Create Post
// @access Private


router.post('/', passport.authenticate('jwt', {session: false}), (req,res) => {
    const {errors, isValid} = validatePostInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });

    newPost.save().then(post => res.json(post));
});

// @route  GET /api/posts
// @desc   Get Post
// @access Public

router.get('/', (req, res) => {
    Post.find().sort({date: -1}).then(posts => res.json(posts)).catch(err => res.status(404).json({nopostfound: 'No Post Found '}));
});


// @route  GET /api/posts/:id
// @desc   Get Particular Post
// @access Public

router.get('/:id', (req, res) => {
    Post.findById(req.params.id).then(post => res.json(post)).catch(err => res.status(404).json({nopostfound: 'No Post Found with that ID'}));
});

// @route  DELETE /api/posts/:id
// @desc   Delete Particular Post
// @access Private

router.delete('/:id', passport.authenticate('jwt', {session: false}), (req,res) => {
    Profile.findOne({user: req.user.id}).then( profile=> {
       Post.findById(req.params.id).then(post => {
            // Check for post owner
           if(post.user.toString() !== req.user.id) {
               res.status(401).json({notauthorized: 'User Not AUthorized'});
           }

           Post.remove().then(() => res.json({success: true}));
       }).catch(err => res.status(404).json({nopostfound: 'No Post Found'}))
    });
});

// @route  POST /api/posts/like/:id
// @desc   Like Post
// @access Private

router.post('/like/:id', passport.authenticate('jwt', {session: false}), (req,res) => {
    Profile.findOne({user: req.user.id}).then( profile=> {
        Post.findById(req.params.id).then(post => {
           if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
               return res.status(400).json({ alreadyliked: 'User already liked the post' });
           }

           post.likes.unshift({user: req.user.id});

           post.save().then(post => res.json(post));
        }).catch(err => res.status(404).json({nopostfound: 'No Post Found'}))
    });
});

// @route  POST /api/posts/unlike/:id
// @desc   Unlike Post
// @access Private

router.post('/unlike/:id', passport.authenticate('jwt', {session: false}), (req,res) => {
    Profile.findOne({user: req.user.id}).then( profile=> {
        Post.findById(req.params.id).then(post => {
            if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                return res.status(400).json({ alreadyliked: 'User has not liked the post' });
            }

            const removeIndex  = post.likes.map(item => item.user.toString()).indexOf(req.user.id);

            post.likes.splice(removeIndex,1 );
            post.save().then(post => res.json(post));
        }).catch(err => res.status(404).json({nopostfound: 'No Post Found'}));
    });
});

// @route  POST /api/posts/comment/:id
// @desc   Comment on Post
// @access Private

router.post('/comment/:id', passport.authenticate('jwt', {session: false}), (req,res) => {
    Post.findById(req.params.id).then(post => {
        const newComment = new Comment({
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.avatar,
            user: req.user.id
        });

        post.comments.unshift(newComment);

        // Save
        post.save().then(post => res.json(post))
    }).catch(err => res.status(404).json({nopostfound: 'No Post Found'}));
});

// @route  DELETE /api/posts/comment/:id/:comment_id
// @desc   Delete Particular Comment on Post
// @access Private

router.post('/comment/:id/:comment_id', passport.authenticate('jwt', {session: false}), (req,res) => {
    Post.findById(req.params.id).then(post => {
        if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
            res.status(404).json({nocommentfound: 'No Comment Found'})
        }

        const removeIndex  = post.comments.map(item => item._id.toString()).indexOf(req.params.comment_id);
        post.comments.splice(removeIndex,1 );
        post.save().then(post => res.json(post));
    }).catch(err => res.status(404).json({nopostfound: 'No Post Found'}));
});

module.exports = router;
