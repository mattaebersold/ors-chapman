import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';
import { colors } from '../constants/colors';
import FAIcon from '../components/FAIcon';

const SupportScreen = () => {
  const handleEmailPress = async () => {
    const email = 'jessicaaebersold@gmail.com';
    const subject = 'Open Road Society Support';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Email Not Available',
          `Please send your support request to: ${email}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Email Error',
        `Please send your support request to: ${email}`,
        [{ text: 'OK' }]
      );
    }
  };

  const supportOptions = [
    {
      title: 'General Support',
      icon: 'comment',
      description: 'Questions about using the platform, account issues, or general feedback.',
      action: handleEmailPress
    },
    {
      title: 'Technical Issues',
      icon: 'plus',
      description: 'Bugs, app crashes, or technical problems you\'re experiencing.',
      action: handleEmailPress
    },
    {
      title: 'Feature Requests',
      icon: 'new',
      description: 'Suggestions for new features or improvements to existing functionality.',
      action: handleEmailPress
    },
    {
      title: 'Community Guidelines',
      icon: 'users',
      description: 'Questions about community rules, content policies, or reporting issues.',
      action: handleEmailPress
    }
  ];

  const faqItems = [
    {
      question: 'How do I create my digital garage?',
      answer: 'Navigate to the Cars section and tap the "+" button to add your first vehicle. You can then add photos, modifications, and maintenance records.'
    },
    {
      question: 'Can I sell parts on the marketplace?',
      answer: 'Yes! Use the "+" button and select "Listing" to create a marketplace post for parts or vehicles you want to sell.'
    },
    {
      question: 'How do I find local events?',
      answer: 'Check the Society section to discover local meetups, drives, and car shows in the Pacific Northwest.'
    },
    {
      question: 'Is my personal information safe?',
      answer: 'We take privacy seriously and only display information you choose to share publicly. Your email and personal details remain private.'
    },
    {
      question: 'How do I delete my account?',
      answer: 'Contact our support team, and we\'ll help you permanently delete your account and all associated data.'
    }
  ];

  const SupportOption = ({ option }) => (
    <TouchableOpacity style={styles.supportCard} onPress={option.action}>
      <View style={styles.supportHeader}>
        <View style={styles.iconContainer}>
          <FAIcon name={option.icon} size={24} color={colors.WHITE} />
        </View>
        <View style={styles.supportContent}>
          <Text style={styles.supportTitle}>{option.title}</Text>
          <Text style={styles.supportDescription}>{option.description}</Text>
        </View>
        <FAIcon name="chevron-right" size={16} color={colors.TEXT_SECONDARY} />
      </View>
    </TouchableOpacity>
  );

  const FAQItem = ({ item, index }) => (
    <View style={styles.faqItem}>
      <Text style={styles.faqQuestion}>{item.question}</Text>
      <Text style={styles.faqAnswer}>{item.answer}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Support</Text>
          <Text style={styles.subtitle}>
            Get in touch with us for help, feedback, or questions about the Open Road Society platform.
          </Text>
        </View>

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          {supportOptions.map((option, index) => (
            <SupportOption key={index} option={option} />
          ))}
        </View>

        {/* Email Button */}
        <View style={styles.emailSection}>
          <TouchableOpacity style={styles.emailButton} onPress={handleEmailPress}>
            <FAIcon name="comment" size={20} color={colors.WHITE} />
            <Text style={styles.emailButtonText}>Send Email</Text>
          </TouchableOpacity>
          <Text style={styles.emailNote}>
            jessicaaebersold@gmail.com
          </Text>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqItems.map((item, index) => (
            <FAQItem key={index} item={item} index={index} />
          ))}
        </View>

        {/* Response Time Info */}
        <View style={styles.responseInfo}>
          <Text style={styles.responseTitle}>Response Times</Text>
          <Text style={styles.responseText}>
            We typically respond to support requests within 24-48 hours. For urgent technical 
            issues, please include "URGENT" in your subject line.
          </Text>
          <Text style={styles.responseText}>
            We're a small team passionate about building the best platform for car enthusiasts, 
            and we appreciate your patience as we work to help everyone.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.TEXT_PRIMARY,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.TEXT_SECONDARY,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.TEXT_PRIMARY,
    marginBottom: 16,
  },
  supportCard: {
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.BRG,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  supportDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.TEXT_SECONDARY,
  },
  emailSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.BRG,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 8,
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.WHITE,
    marginLeft: 12,
  },
  emailNote: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
  },
  faqItem: {
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BRG,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.TEXT_PRIMARY,
  },
  responseInfo: {
    marginVertical: 20,
    padding: 20,
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  responseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.BRG,
    marginBottom: 12,
  },
  responseText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.TEXT_PRIMARY,
    marginBottom: 12,
  },
});

export default SupportScreen;