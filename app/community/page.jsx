"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserAuth } from "@/context/Authcontext";
import { createClient } from '@supabase/supabase-js';
import TextareaAutosize from "react-textarea-autosize";
import { formatDistanceToNow } from "date-fns";
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  Send,
  Filter,
  Search,
  Users,
  TrendingUp,
  Activity,
  Stethoscope,
  BookOpen,
  Target,
  Loader2,
  ChevronDown,
  ChevronUp,
  Tag,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";

// Initialize Supabase client (use your existing config)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const CommunityPage = () => {
  const { user } = UserAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const [expandedContent, setExpandedContent] = useState(new Set());
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [userLikes, setUserLikes] = useState(new Set());

  const categories = [
    { value: "general", label: "General Discussion", icon: MessageCircle, color: "bg-blue-100 text-blue-700", description: "Share general health topics and experiences" },
    { value: "nutrition", label: "Nutrition & Diet", icon: Target, color: "bg-green-100 text-green-700", description: "Discuss healthy eating and nutrition tips" },
    { value: "fitness", label: "Fitness & Exercise", icon: Activity, color: "bg-orange-100 text-orange-700", description: "Share workout routines and fitness goals" },
    { value: "mental-health", label: "Mental Health", icon: Heart, color: "bg-pink-100 text-pink-700", description: "Support for mental wellness and coping strategies" },
    { value: "medical", label: "Medical Questions", icon: Stethoscope, color: "bg-purple-100 text-purple-700", description: "Discuss symptoms and treatment experiences" },
    { value: "success-stories", label: "Success Stories", icon: TrendingUp, color: "bg-yellow-100 text-yellow-700", description: "Celebrate health milestones and victories" },
    { value: "resources", label: "Resources & Tips", icon: BookOpen, color: "bg-indigo-100 text-indigo-700", description: "Share helpful resources and practical tips" }
  ];

  // Optimized user display info helper
  const getUserDisplayInfo = useCallback((userMetadata, email) => {
    const displayName = userMetadata?.display_name || 
                       userMetadata?.full_name || 
                       email?.split('@')[0] || 
                       'Community Member';
    
    const avatarUrl = userMetadata?.avatar_url || 
                     userMetadata?.picture || 
                     null;
    
    return { displayName, avatarUrl };
  }, []);

  // Content truncation helper
  const truncateContent = useCallback((content, maxLength = 300) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  }, []);

  // Enhanced real-time subscriptions with optimistic updates
  useEffect(() => {
    if (!user) return;

    fetchPosts();
    fetchUserLikes();

    // Subscribe to real-time changes with better handling
    const postsSubscription = supabase
      .channel('community_posts_realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'community_posts' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Add user info for real-time post if it's from current user
            const postWithUser = {
              ...payload.new,
              user_info: payload.new.user_id === user.id ? user : null
            };
            setPosts(prev => [postWithUser, ...prev]);
            if (payload.new.user_id !== user.id) {
              toast.success("New post added to community! 🎉");
            }
          } else if (payload.eventType === 'UPDATE') {
            setPosts(prev => prev.map(post => 
              post.id === payload.new.id ? { ...post, ...payload.new } : post
            ));
          } else if (payload.eventType === 'DELETE') {
            setPosts(prev => prev.filter(post => post.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const commentsSubscription = supabase
      .channel('community_comments_realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'community_comments' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const commentWithUser = {
              ...payload.new,
              user_info: payload.new.user_id === user.id ? user : null
            };
            
            setComments(prev => ({
              ...prev,
              [payload.new.post_id]: [
                ...(prev[payload.new.post_id] || []),
                commentWithUser
              ]
            }));
            
            // Update comment count in posts
            setPosts(prev => prev.map(post => 
              post.id === payload.new.post_id 
                ? { ...post, comments_count: (post.comments_count || 0) + 1 }
                : post
            ));
            
            if (payload.new.user_id !== user.id) {
              toast.success("New comment added! 💬");
            }
          }
        }
      )
      .subscribe();

    const likesSubscription = supabase
      .channel('community_likes_realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'community_likes' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            if (payload.new.user_id === user.id) {
              setUserLikes(prev => new Set([...prev, payload.new.post_id]));
            }
            setPosts(prev => prev.map(post => 
              post.id === payload.new.post_id 
                ? { ...post, likes_count: (post.likes_count || 0) + 1 }
                : post
            ));
          } else if (payload.eventType === 'DELETE') {
            if (payload.old.user_id === user.id) {
              setUserLikes(prev => {
                const newSet = new Set(prev);
                newSet.delete(payload.old.post_id);
                return newSet;
              });
            }
            setPosts(prev => prev.map(post => 
              post.id === payload.old.post_id 
                ? { ...post, likes_count: Math.max((post.likes_count || 1) - 1, 0) }
                : post
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsSubscription);
      supabase.removeChannel(commentsSubscription);
      supabase.removeChannel(likesSubscription);
    };
  }, [user]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user info for each post
      const postsWithUsers = await Promise.all(
        (data || []).map(async (post) => {
          const { data: userData } = await supabase.auth.admin.getUserById(post.user_id);
          return {
            ...post,
            user_info: userData?.user || null
          };
        })
      );

      setPosts(postsWithUsers);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load community posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLikes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('community_likes')
        .select('post_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserLikes(new Set((data || []).map(like => like.post_id)));
    } catch (error) {
      console.error('Error fetching user likes:', error);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const { data, error } = await supabase
        .from('community_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch user info for each comment
      const commentsWithUsers = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: userData } = await supabase.auth.admin.getUserById(comment.user_id);
          return {
            ...comment,
            user_info: userData?.user || null
          };
        })
      );

      setComments(prev => ({
        ...prev,
        [postId]: commentsWithUsers
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Optimistic post creation
  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast.error("Please fill in both title and content");
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticPost = {
      id: tempId,
      user_id: user.id,
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      category: selectedCategory,
      likes_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
      user_info: user
    };

    // Optimistic update
    setPosts(prev => [optimisticPost, ...prev]);
    setNewPostTitle("");
    setNewPostContent("");
    setShowNewPostForm(false);
    toast.success("Post created successfully! 🎉");

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert([{
          user_id: user.id,
          title: optimisticPost.title,
          content: optimisticPost.content,
          category: selectedCategory
        }])
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic post with real post
      setPosts(prev => prev.map(post => 
        post.id === tempId ? { ...data, user_info: user } : post
      ));
    } catch (error) {
      // Remove optimistic post on error
      setPosts(prev => prev.filter(post => post.id !== tempId));
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  // Optimistic comment handling
  const handleAddComment = async (postId) => {
    const commentText = newComments[postId]?.trim();
    if (!commentText) return;

    const tempCommentId = `temp-comment-${Date.now()}`;
    const optimisticComment = {
      id: tempCommentId,
      post_id: postId,
      user_id: user.id,
      content: commentText,
      created_at: new Date().toISOString(),
      user_info: user
    };

    // Optimistic updates
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), optimisticComment]
    }));

    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, comments_count: (post.comments_count || 0) + 1 }
        : post
    ));

    setNewComments(prev => ({
      ...prev,
      [postId]: ""
    }));

    toast.success("Comment added!");

    try {
      const { data, error } = await supabase
        .from('community_comments')
        .insert([{
          post_id: postId,
          user_id: user.id,
          content: commentText
        }])
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic comment
      setComments(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).map(comment =>
          comment.id === tempCommentId ? { ...data, user_info: user } : comment
        )
      }));
    } catch (error) {
      // Revert optimistic updates
      setComments(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(comment => comment.id !== tempCommentId)
      }));
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, comments_count: Math.max((post.comments_count || 1) - 1, 0) }
          : post
      ));
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  // Optimistic like handling
  const handleLikePost = async (postId) => {
    const isLiked = userLikes.has(postId);
    
    // Optimistic updates
    if (isLiked) {
      setUserLikes(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes_count: Math.max((post.likes_count || 1) - 1, 0) }
          : post
      ));
      toast.success("Post unliked");
    } else {
      setUserLikes(prev => new Set([...prev, postId]));
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes_count: (post.likes_count || 0) + 1 }
          : post
      ));
      toast.success("Post liked! ❤️");
    }
    
    try {
      if (isLiked) {
        const { error } = await supabase
          .from('community_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('community_likes')
          .insert([{
            post_id: postId,
            user_id: user.id
          }]);
        if (error) throw error;
      }
    } catch (error) {
      // Revert optimistic update on error
      if (isLiked) {
        setUserLikes(prev => new Set([...prev, postId]));
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: (post.likes_count || 0) + 1 }
            : post
        ));
      } else {
        setUserLikes(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: Math.max((post.likes_count || 1) - 1, 0) }
            : post
        ));
      }
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const togglePostExpansion = (postId) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
      if (!comments[postId]) {
        fetchComments(postId);
      }
    }
    setExpandedPosts(newExpanded);
  };

  const toggleContentExpansion = (postId) => {
    const newExpanded = new Set(expandedContent);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedContent(newExpanded);
  };

  // Memoized filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           post.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === "all" || post.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [posts, searchQuery, filterCategory]);

  const getCategoryInfo = useCallback((category) => {
    return categories.find(cat => cat.value === category) || categories[0];
  }, [categories]);

  if (!user) {
    return (
      <div className="min-h-screen w-full bg-[#D9E89A] flex items-center justify-center pt-32">
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg p-8 text-center max-w-md">
          <CardContent>
            <Users className="h-16 w-16 text-[#c1e141] mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-black mb-3">Join Our Supportive Community</h2>
            <p className="text-black/70 mb-6 leading-relaxed">
              Connect with others on similar health journeys. Share experiences, find support, and celebrate victories together in a safe, moderated environment.
            </p>
            <div className="space-y-3 text-sm text-black/60 mb-6">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Share coping strategies</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Emotional support network</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Success story inspiration</span>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = '/signin'}
              className="bg-[#c1e141] text-black hover:bg-[#c1e141]/90 w-full"
              size="lg"
            >
              Join Community
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#D9E89A] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-black mx-auto mb-4" />
          <p className="text-black/70">Loading community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#D9E89A] pt-32 pb-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto px-4"
      >
        {/* Enhanced Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <Badge variant="secondary" className="rounded-full px-4 py-2 bg-white/20 text-black border-none mb-4">
            <Users className="h-4 w-4 mr-2" />
            Supportive Health Community
          </Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-black mb-2">
            Share, Support, and Thrive Together
          </h1>
          <p className="text-black/70 text-lg max-w-3xl mx-auto">
            A safe space for patients to share coping strategies, celebrate success stories, and provide emotional support on their wellness journey.
          </p>
        </motion.div>

        {/* Dynamic Stats */}
        {/* <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { 
              icon: Users, 
              label: "Community Members", 
              value: posts.length > 0 ? `${Math.max(posts.length * 12, 1200)}+` : "1,200+", 
              color: "text-blue-600" 
            },
            { 
              icon: MessageCircle, 
              label: "Posts Today", 
              value: posts.filter(post => {
                const today = new Date();
                const postDate = new Date(post.created_at);
                return postDate.toDateString() === today.toDateString();
              }).length.toString(), 
              color: "text-green-600" 
            },
            { 
              icon: Heart, 
              label: "Support Given", 
              value: posts.reduce((sum, post) => sum + (post.likes_count || 0), 0).toString(), 
              color: "text-pink-600" 
            },
            { 
              icon: TrendingUp, 
              label: "Success Stories", 
              value: posts.filter(post => post.category === 'success-stories').length.toString(), 
              color: "text-yellow-600" 
            }
          ].map((stat, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <stat.icon className={`h-6 w-6 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold text-black">{stat.value}</div>
                <div className="text-sm text-black/60">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div> */}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Filter Bar */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-black/50" />
                      <Input
                        placeholder="Search for support, experiences, or topics..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/70 border-black/20 focus:border-[#c1e141]"
                      />
                    </div>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-full sm:w-52 bg-white/70 border-black/20">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center">
                              <cat.icon className="h-4 w-4 mr-2" />
                              {cat.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => setShowNewPostForm(!showNewPostForm)}
                      className="bg-[#c1e141] text-black hover:bg-[#c1e141]/90 whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Share Your Story
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* New Post Form */}
            <AnimatePresence>
              {showNewPostForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-xl text-black">Share with the Community</CardTitle>
                      <CardDescription className="text-black/60">
                        Your experience could help someone else on their journey. Share your story, ask for support, or offer encouragement.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="postTitle" className="text-black font-medium">Title</Label>
                        <Input
                          id="postTitle"
                          placeholder="What would you like to share today?"
                          value={newPostTitle}
                          onChange={(e) => setNewPostTitle(e.target.value)}
                          className="bg-white/70 border-black/20 focus:border-[#c1e141]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-black font-medium">Category</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="bg-white/70 border-black/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => {
                              const IconComponent = cat.icon;
                              return (
                                <SelectItem key={cat.value} value={cat.value}>
                                  <div className="flex flex-col items-start py-1">
                                    <div className="flex items-center">
                                      <IconComponent className="h-4 w-4 mr-2" />
                                      {cat.label}
                                    </div>
                                    <div className="text-xs text-muted-foreground ml-6">
                                      {cat.description}
                                    </div>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="postContent" className="text-black font-medium">Your Story</Label>
                        <TextareaAutosize
                          id="postContent"
                          placeholder="Share your experience, ask for support, or offer encouragement to others..."
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          className="w-full p-3 bg-white/70 border border-black/20 rounded-lg focus:border-[#c1e141] focus:outline-none resize-none min-h-[120px] text-black placeholder:text-black/50"
                          minRows={4}
                          maxRows={10}
                        />
                        <div className="flex items-center space-x-2 text-xs text-black/50">
                          <Info className="h-3 w-3" />
                          <span>Remember: Share experiences, not medical advice. Be supportive and respectful.</span>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3">
                        <Button
                          variant="outline"
                          onClick={() => setShowNewPostForm(false)}
                          className="border-black/20 text-black hover:bg-black/5"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreatePost}
                          disabled={submitting || !newPostTitle.trim() || !newPostContent.trim()}
                          className="bg-black text-white hover:bg-black/90"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Sharing...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Share Story
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Posts List */}
            <div className="space-y-6">
              <AnimatePresence>
                {filteredPosts.map((post, index) => {
                  const categoryInfo = getCategoryInfo(post.category);
                  const IconComponent = categoryInfo.icon;
                  const isExpanded = expandedPosts.has(post.id);
                  const isContentExpanded = expandedContent.has(post.id);
                  const postComments = comments[post.id] || [];
                  const isLiked = userLikes.has(post.id);
                  const shouldTruncate = post.content.length > 300;
                  const displayContent = isContentExpanded ? post.content : truncateContent(post.content);
                  
                  // Get user display info
                  const userDisplayInfo = post.user_info ? 
                    getUserDisplayInfo(post.user_info.user_metadata, post.user_info.email) : 
                    { displayName: 'Community Member', avatarUrl: null };

                  return (
                    <motion.div
                      key={post.id}
                      variants={itemVariants}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: Math.min(index * 0.1, 0.5) }}
                      whileHover={{ y: -2 }}
                    >
                      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="pb-4">
                          <div className="flex items-start space-x-4">
                            <Avatar className="ring-2 ring-[#c1e141]/20">
                              <AvatarImage src={userDisplayInfo.avatarUrl} />
                              <AvatarFallback className="bg-[#c1e141] text-black font-medium">
                                {userDisplayInfo.displayName[0]?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge className={`${categoryInfo.color} font-medium`}>
                                  <IconComponent className="h-3 w-3 mr-1" />
                                  {categoryInfo.label}
                                </Badge>
                              </div>
                              <h3 className="text-xl font-semibold text-black mb-1">{post.title}</h3>
                              <div className="flex items-center space-x-2 text-sm text-black/60">
                                <span className="font-medium">{userDisplayInfo.displayName}</span>
                                <span>•</span>
                                <span>{formatDistanceToNow(new Date(post.created_at))} ago</span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent>
                          {/* Content with blur effect for truncated text */}
                          <div className="relative mb-4">
                            <div className="text-black/80 whitespace-pre-wrap leading-relaxed">
                              {displayContent}
                            </div>
                            {shouldTruncate && !isContentExpanded && (
                              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/90 to-transparent pointer-events-none" />
                            )}
                            {shouldTruncate && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleContentExpansion(post.id)}
                                className="text-black mt-2 p-0 h-auto font-medium"
                              >
                                {isContentExpanded ? (
                                  <>
                                    <ChevronUp className="h-4 w-4 mr-1" />
                                    Show less
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-4 w-4 mr-1" />
                                    Read more
                                  </>
                                )}
                              </Button>
                            )}
                          </div>

                          <div className="flex items-center justify-between border-t border-black/10 pt-4">
                            <div className="flex items-center space-x-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLikePost(post.id)}
                                className={`hover:bg-pink-50 transition-all duration-200 ${
                                  isLiked 
                                    ? 'text-pink-600 hover:text-pink-700' 
                                    : 'text-black/60 hover:text-pink-600'
                                }`}
                              >
                                <Heart className={`h-4 w-4 mr-1 transition-all duration-200 ${isLiked ? 'fill-current scale-110' : ''}`} />
                                {post.likes_count || 0}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => togglePostExpansion(post.id)}
                                className="text-black/60 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                              >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                {postComments.length}
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 ml-1" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 ml-1" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-black/60 hover:text-green-600 hover:bg-green-50 transition-all duration-200"
                                onClick={() => {
                                  navigator.clipboard.writeText(window.location.origin + `/community#post-${post.id}`);
                                  toast.success("Link copied to clipboard!");
                                }}
                              >
                                <Share2 className="h-4 w-4 mr-1" />
                                Share
                              </Button>
                            </div>
                          </div>

                          {/* Comments Section */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-6 border-t border-black/10 pt-6"
                              >
                                {/* Add Comment */}
                                <div className="flex space-x-3 mb-6">
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src={user.user_metadata?.avatar_url} />
                                    <AvatarFallback className="bg-[#c1e141] text-black text-xs">
                                      {getUserDisplayInfo(user.user_metadata, user.email).displayName[0]?.toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 flex space-x-2">
                                    <Input
                                      placeholder="Share your support or experience..."
                                      value={newComments[post.id] || ""}
                                      onChange={(e) => setNewComments(prev => ({
                                        ...prev,
                                        [post.id]: e.target.value
                                      }))}
                                      className="flex-1 bg-white/70 border-black/20 focus:border-[#c1e141]"
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault();
                                          handleAddComment(post.id);
                                        }
                                      }}
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => handleAddComment(post.id)}
                                      disabled={!newComments[post.id]?.trim()}
                                      className="bg-[#c1e141] text-black hover:bg-[#c1e141]/90"
                                    >
                                      <Send className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Comments List */}
                                <div className="space-y-4">
                                  {postComments.map((comment) => {
                                    const commentUserInfo = comment.user_info ? 
                                      getUserDisplayInfo(comment.user_info.user_metadata, comment.user_info.email) : 
                                      { displayName: 'Community Member', avatarUrl: null };

                                    return (
                                      <motion.div
                                        key={comment.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex space-x-3"
                                      >
                                        <Avatar className="w-8 h-8">
                                          <AvatarImage src={commentUserInfo.avatarUrl} />
                                          <AvatarFallback className="bg-gray-200 text-black text-xs font-medium">
                                            {commentUserInfo.displayName[0]?.toUpperCase() || "U"}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                          <div className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-center space-x-2 mb-1">
                                              <span className="text-sm font-medium text-black">
                                                {commentUserInfo.displayName}
                                              </span>
                                              <span className="text-xs text-black/60">
                                                {formatDistanceToNow(new Date(comment.created_at))} ago
                                              </span>
                                            </div>
                                            <p className="text-sm text-black/80 leading-relaxed">{comment.content}</p>
                                          </div>
                                        </div>
                                      </motion.div>
                                    );
                                  })}
                                  
                                  {postComments.length === 0 && (
                                    <div className="text-center py-6 text-black/50">
                                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                      <p>Be the first to offer support or share your experience.</p>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {filteredPosts.length === 0 && (
                <motion.div variants={itemVariants} className="text-center py-16">
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 max-w-md mx-auto">
                    <MessageCircle className="h-12 w-12 text-black/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-black mb-2">
                      {searchQuery || filterCategory !== "all" 
                        ? "No posts match your search" 
                        : "Start the Conversation"
                      }
                    </h3>
                    <p className="text-black/60 mb-4">
                      {searchQuery || filterCategory !== "all" 
                        ? "Try adjusting your search or browse all categories" 
                        : "Be the first to share your story and support others in the community."
                      }
                    </p>
                    {!(searchQuery || filterCategory !== "all") && (
                      <Button
                        onClick={() => setShowNewPostForm(true)}
                        className="bg-[#c1e141] text-black hover:bg-[#c1e141]/90"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Share Your Story
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg text-black flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    Support Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    const categoryPostCount = posts.filter(post => post.category === category.value).length;
                    
                    return (
                      <Button
                        key={category.value}
                        variant={filterCategory === category.value ? "default" : "ghost"}
                        className={`w-full justify-between text-sm transition-all duration-200 ${
                          filterCategory === category.value 
                            ? "bg-[#c1e141] text-black hover:bg-[#c1e141]/90" 
                            : "text-black/70 hover:bg-black/5"
                        }`}
                        onClick={() => setFilterCategory(category.value)}
                      >
                        <div className="flex items-center">
                          <IconComponent className="h-4 w-4 mr-2" />
                          {category.label}
                        </div>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {categoryPostCount}
                        </Badge>
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

            {/* Community Guidelines */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg text-black flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Community Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-black/70 space-y-3">
                  <div className="flex items-start space-x-3">
                    <Heart className="h-4 w-4 text-pink-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-black">Be Supportive</p>
                      <p className="text-xs">Offer encouragement and understanding to all community members</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Stethoscope className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-black">Share Experiences</p>
                      <p className="text-xs">Share personal stories, not medical advice or diagnoses</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-black">Respect Privacy</p>
                      <p className="text-xs">Keep personal information confidential and respect boundaries</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <BookOpen className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-black">Stay Relevant</p>
                      <p className="text-xs">Keep discussions focused on health, wellness, and support</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Help */}
            {/* <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-[#c1e141]/10 to-[#c1e141]/5 backdrop-blur-sm border-0 shadow-md">
                <CardContent className="p-4 text-center">
                  <div className="mb-3">
                    <Heart className="h-8 w-8 text-[#c1e141] mx-auto" />
                  </div>
                  <p className="text-sm text-black/80 mb-3 font-medium">
                    Need immediate support?
                  </p>
                  <p className="text-xs text-black/60 mb-4">
                    If you're in crisis, please contact your healthcare provider or emergency services immediately.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#c1e141] text-black hover:bg-[#c1e141]/10"
                    onClick={() => {}}
                  >
                    Emergency Resources
                  </Button>
                </CardContent>
              </Card>
            </motion.div> */}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CommunityPage;
